/**
 * VendorLocation Controller
 * Handles:
 *  - Upsert vendor geo-coordinates
 *  - GET /api/vendors/nearby  — find vendors near a lat/lng with optional radius filter
 *    Sorts by: distance → rating → availability (next 2 hours)
 */

const VendorLocation = require("../models/VendorLocation.js");
const VendorAvailability = require("../models/VendorAvailability.js");
const Service = require("../models/Service.js");
const Review = require("../models/reviewSchema.js");
const User = require("../models/User.js");

// ─── Validation helpers ────────────────────────────────────────────────────────

/**
 * Validate latitude (-90 to 90) and longitude (-180 to 180).
 */
const isValidCoordinates = (lat, lng) => {
  const la = parseFloat(lat);
  const lo = parseFloat(lng);
  return (
    !isNaN(la) && !isNaN(lo) &&
    la >= -90 && la <= 90 &&
    lo >= -180 && lo <= 180
  );
};

// ─── Upsert vendor location ────────────────────────────────────────────────────

/**
 * PUT /api/vendors/location
 * Body: { latitude, longitude, address?, serviceRadius? }
 * Auth: service middleware (vendor must be logged in)
 */
const upsertVendorLocation = async (req, res) => {
  try {
    const vendorId = req.user._id;
    const { latitude, longitude, address, serviceRadius } = req.body;

    // Validate coordinates
    if (!latitude || !longitude) {
      return res.status(400).json({ message: "latitude and longitude are required." });
    }
    if (!isValidCoordinates(latitude, longitude)) {
      return res.status(400).json({
        message: "Invalid coordinates. latitude must be -90 to 90, longitude -180 to 180.",
      });
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    const locationDoc = await VendorLocation.findOneAndUpdate(
      { vendor: vendorId },
      {
        vendor: vendorId,
        location: {
          type: "Point",
          coordinates: [lng, lat], // GeoJSON: [lng, lat]
        },
        ...(address !== undefined && { address }),
        ...(serviceRadius !== undefined && { serviceRadius: parseFloat(serviceRadius) }),
        isActive: true,
      },
      { upsert: true, new: true, runValidators: true }
    );

    return res.status(200).json({
      message: "Vendor location updated successfully.",
      data: {
        vendor: vendorId,
        latitude: lat,
        longitude: lng,
        address: locationDoc.address,
        serviceRadius: locationDoc.serviceRadius,
      },
    });
  } catch (error) {
    console.error("upsertVendorLocation error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─── Get nearby vendors ────────────────────────────────────────────────────────

/**
 * GET /api/vendors/nearby?lat={lat}&lng={lng}&radius={km}&category={cat}
 *
 * Returns vendors sorted by:
 *  1. Distance (nearest first)
 *  2. Average rating (highest first)
 *  3. Availability within next 2 hours (available vendors ranked higher)
 *
 * Response shape is map-render compatible (vendor_id, name, lat, lng, rating,
 * distance, service_types).
 */
const getNearbyVendors = async (req, res) => {
  try {
    const { lat, lng, radius = 10, category } = req.query;

    // ── 1. Validate query params ──────────────────────────────────────────────
    if (!lat || !lng) {
      return res.status(400).json({ message: "lat and lng query parameters are required." });
    }
    if (!isValidCoordinates(lat, lng)) {
      return res.status(400).json({ message: "Invalid lat/lng values." });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const radiusKm = Math.min(parseFloat(radius) || 10, 100); // cap at 100 km
    const radiusMeters = radiusKm * 1000;

    // ── 2. Geospatial query — find vendor locations within radius ─────────────
    const nearbyLocations = await VendorLocation.aggregate([
      {
        $geoNear: {
          near: { type: "Point", coordinates: [longitude, latitude] },
          distanceField: "distanceMeters",
          maxDistance: radiusMeters,
          spherical: true,
          query: { isActive: true },
        },
      },
      {
        $project: {
          vendor: 1,
          location: 1,
          address: 1,
          serviceRadius: 1,
          distanceKm: { $divide: ["$distanceMeters", 1000] },
        },
      },
    ]);

    if (!nearbyLocations.length) {
      return res.status(200).json({ message: "No vendors found nearby.", data: [] });
    }

    const vendorIds = nearbyLocations.map((l) => l.vendor);

    // ── 3. Build distance lookup map ──────────────────────────────────────────
    const distanceMap = {};
    nearbyLocations.forEach((l) => {
      distanceMap[l.vendor.toString()] = {
        distanceKm: parseFloat(l.distanceKm.toFixed(2)),
        latitude: l.location.coordinates[1],
        longitude: l.location.coordinates[0],
        address: l.address,
      };
    });

    // ── 4. Fetch vendor user details ──────────────────────────────────────────
    // ✅ Only fetch VERIFIED and NON-BLOCKED vendors
    const vendors = await User.find(
      { 
        _id: { $in: vendorIds }, 
        role: "service",
        isVerified: true,    // ✅ Only verified vendors
        isBlocked: false     // ✅ Not blocked vendors
      },
      "firstname lastname email contact city state"
    ).lean();

    if (vendors.length === 0) {
      return res.status(200).json({ 
        message: "No verified vendors found nearby.", 
        meta: { userLocation: { latitude, longitude }, radiusKm, totalFound: 0 },
        data: [] 
      });
    }

    // ── 5. Fetch services per vendor (for service_types + rating) ─────────────
    // ✅ Only fetch APPROVED services
    const services = await Service.find(
      { 
        createdBy: { $in: vendorIds },
        approvalStatus: "approved"  // ✅ Only approved services
      },
      "createdBy name category price"
    ).lean();

    // Build service map: vendorId → [services]
    const serviceMap = {};
    services.forEach((s) => {
      const vid = s.createdBy.toString();
      if (!serviceMap[vid]) serviceMap[vid] = [];
      serviceMap[vid].push(s);
    });

    // ── 6. Compute average rating per vendor ──────────────────────────────────
    const ratingAgg = await Review.aggregate([
      { $match: { serviceman: { $in: vendorIds } } },
      {
        $group: {
          _id: "$serviceman",
          avgRating: { $avg: "$rating" },
          reviewCount: { $sum: 1 },
        },
      },
    ]);

    const ratingMap = {};
    ratingAgg.forEach((r) => {
      ratingMap[r._id.toString()] = {
        avgRating: parseFloat(r.avgRating.toFixed(1)),
        reviewCount: r.reviewCount,
      };
    });

    // ── 7. Check availability in next 2 hours ─────────────────────────────────
    const now = new Date();
    const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000);

    const availableSlots = await VendorAvailability.find({
      vendor: { $in: vendorIds },
      startTime: { $gte: now, $lte: twoHoursLater },
      isBooked: false,
    }).lean();

    const availableVendorSet = new Set(availableSlots.map((s) => s.vendor.toString()));

    // ── 8. Assemble response objects ──────────────────────────────────────────
    let results = vendors.map((vendor) => {
      const vid = vendor._id.toString();
      const geo = distanceMap[vid] || {};
      const rating = ratingMap[vid] || { avgRating: 0, reviewCount: 0 };
      const vendorServices = serviceMap[vid] || [];

      // Filter by category if provided
      const serviceTypes = [...new Set(vendorServices.map((s) => s.category))];

      return {
        vendor_id: vendor._id,
        name: `${vendor.firstname} ${vendor.lastname}`,
        email: vendor.email,
        contact: vendor.contact,
        city: vendor.city,
        state: vendor.state,
        latitude: geo.latitude,
        longitude: geo.longitude,
        address: geo.address,
        distance: geo.distanceKm,          // in km
        rating: rating.avgRating,
        reviewCount: rating.reviewCount,
        service_types: serviceTypes,
        services: vendorServices.map((s) => ({
          id: s._id,
          name: s.name,
          category: s.category,
          price: s.price,
        })),
        availableWithinNextTwoHours: availableVendorSet.has(vid),
      };
    });

    // ── 9. Apply category filter ──────────────────────────────────────────────
    if (category) {
      const cat = category.toLowerCase();
      results = results.filter((v) =>
        v.service_types.some((t) => t.toLowerCase().includes(cat))
      );
    }

    // ── 10. Sort: distance ASC → rating DESC → availability DESC ─────────────
    results.sort((a, b) => {
      // Primary: distance (nearest first)
      if (a.distance !== b.distance) return a.distance - b.distance;
      // Secondary: rating (highest first)
      if (b.rating !== a.rating) return b.rating - a.rating;
      // Tertiary: availability (available first)
      return (b.availableWithinNextTwoHours ? 1 : 0) - (a.availableWithinNextTwoHours ? 1 : 0);
    });

    return res.status(200).json({
      message: "Nearby vendors fetched successfully.",
      meta: {
        userLocation: { latitude, longitude },
        radiusKm,
        totalFound: results.length,
      },
      data: results,
    });
  } catch (error) {
    console.error("getNearbyVendors error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─── Vendor availability management ───────────────────────────────────────────

/**
 * POST /api/vendors/availability
 * Body: { slots: [{ startTime, endTime }] }
 * Allows a vendor to add available time slots.
 */
const addAvailabilitySlots = async (req, res) => {
  try {
    const vendorId = req.user._id;
    const { slots } = req.body;

    if (!Array.isArray(slots) || slots.length === 0) {
      return res.status(400).json({ message: "slots array is required and must not be empty." });
    }

    const now = new Date();
    const docs = [];

    for (const slot of slots) {
      const start = new Date(slot.startTime);
      const end = new Date(slot.endTime);

      if (isNaN(start) || isNaN(end)) {
        return res.status(400).json({ message: `Invalid date in slot: ${JSON.stringify(slot)}` });
      }
      if (start < now) {
        return res.status(400).json({ message: "Slot startTime cannot be in the past." });
      }
      if (end <= start) {
        return res.status(400).json({ message: "Slot endTime must be after startTime." });
      }

      docs.push({ vendor: vendorId, startTime: start, endTime: end, isBooked: false });
    }

    const created = await VendorAvailability.insertMany(docs);

    return res.status(201).json({
      message: `${created.length} availability slot(s) added.`,
      data: created,
    });
  } catch (error) {
    console.error("addAvailabilitySlots error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * GET /api/vendors/:vendorId/availability
 * Returns upcoming available (unbooked) slots for a vendor.
 */
const getVendorAvailability = async (req, res) => {
  try {
    const { vendorId } = req.params;
    const now = new Date();

    const slots = await VendorAvailability.find({
      vendor: vendorId,
      startTime: { $gte: now },
      isBooked: false,
    })
      .sort({ startTime: 1 })
      .lean();

    return res.status(200).json({
      message: "Availability fetched.",
      data: slots,
    });
  } catch (error) {
    console.error("getVendorAvailability error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  upsertVendorLocation,
  getNearbyVendors,
  addAvailabilitySlots,
  getVendorAvailability,
};

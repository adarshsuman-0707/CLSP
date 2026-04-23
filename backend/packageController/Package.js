/**
 * Package Controller
 * Handles CRUD for service packages (admin only for create/update/delete)
 * and package booking by users.
 */

const ServicePackage = require("../models/ServicePackage.js");
const PackageBooking = require("../models/PackageBooking.js");
const Service = require("../models/Service.js");
const mongoose = require("mongoose");

// ─── Validation helper ─────────────────────────────────────────────────────────

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// ─── Admin: Create package ─────────────────────────────────────────────────────

/**
 * POST /api/packages
 * Body: { name, description, price, discountPercentage, serviceIds: [] }
 * Auth: admin only
 */
const createPackage = async (req, res) => {
  try {
    const { name, description, price, discountPercentage = 0, serviceIds } = req.body;

    // ── Validate required fields ──────────────────────────────────────────────
    if (!name || !price) {
      return res.status(400).json({ message: "name and price are required." });
    }
    if (typeof price !== "number" || price < 0) {
      return res.status(400).json({ message: "price must be a non-negative number." });
    }
    if (discountPercentage < 0 || discountPercentage > 100) {
      return res.status(400).json({ message: "discountPercentage must be between 0 and 100." });
    }

    // ── Validate service IDs ──────────────────────────────────────────────────
    if (!Array.isArray(serviceIds) || serviceIds.length === 0) {
      return res.status(400).json({ message: "serviceIds must be a non-empty array." });
    }
    const invalidIds = serviceIds.filter((id) => !isValidObjectId(id));
    if (invalidIds.length > 0) {
      return res.status(400).json({ message: `Invalid service IDs: ${invalidIds.join(", ")}` });
    }

    // ── Verify all services exist ─────────────────────────────────────────────
    const existingServices = await Service.find({ _id: { $in: serviceIds } }, "_id").lean();
    if (existingServices.length !== serviceIds.length) {
      const foundIds = existingServices.map((s) => s._id.toString());
      const missing = serviceIds.filter((id) => !foundIds.includes(id));
      return res.status(404).json({ message: `Services not found: ${missing.join(", ")}` });
    }

    const pkg = new ServicePackage({
      name: name.trim(),
      description: description?.trim() || "",
      price,
      discountPercentage,
      services: serviceIds,
      createdBy: req.user._id,
    });

    await pkg.save();

    return res.status(201).json({
      message: "Package created successfully.",
      data: pkg,
    });
  } catch (error) {
    console.error("createPackage error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─── List all active packages ──────────────────────────────────────────────────

/**
 * GET /api/packages
 * Public — returns all active packages with basic service info.
 */
const listPackages = async (req, res) => {
  try {
    const packages = await ServicePackage.find({ isActive: true })
      .populate("services", "name category price duration")
      .populate("createdBy", "firstname lastname")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      message: "Packages fetched successfully.",
      total: packages.length,
      data: packages,
    });
  } catch (error) {
    console.error("listPackages error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─── Get single package with full service details ──────────────────────────────

/**
 * GET /api/packages/:id
 */
const getPackageById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid package ID." });
    }

    const pkg = await ServicePackage.findOne({ _id: id, isActive: true })
      .populate("services", "name description category price duration")
      .populate("createdBy", "firstname lastname email")
      .lean();

    if (!pkg) {
      return res.status(404).json({ message: "Package not found." });
    }

    return res.status(200).json({
      message: "Package details fetched.",
      data: pkg,
    });
  } catch (error) {
    console.error("getPackageById error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─── Admin: Update package ─────────────────────────────────────────────────────

/**
 * PUT /api/packages/:id
 * Auth: admin only
 */
const updatePackage = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid package ID." });
    }

    const { name, description, price, discountPercentage, serviceIds, isActive } = req.body;

    const pkg = await ServicePackage.findById(id);
    if (!pkg) return res.status(404).json({ message: "Package not found." });

    if (name !== undefined) pkg.name = name.trim();
    if (description !== undefined) pkg.description = description.trim();
    if (price !== undefined) {
      if (typeof price !== "number" || price < 0)
        return res.status(400).json({ message: "price must be a non-negative number." });
      pkg.price = price;
    }
    if (discountPercentage !== undefined) {
      if (discountPercentage < 0 || discountPercentage > 100)
        return res.status(400).json({ message: "discountPercentage must be 0–100." });
      pkg.discountPercentage = discountPercentage;
    }
    if (serviceIds !== undefined) {
      if (!Array.isArray(serviceIds) || serviceIds.length === 0)
        return res.status(400).json({ message: "serviceIds must be a non-empty array." });
      const invalidIds = serviceIds.filter((sid) => !isValidObjectId(sid));
      if (invalidIds.length > 0)
        return res.status(400).json({ message: `Invalid service IDs: ${invalidIds.join(", ")}` });

      const existing = await Service.find({ _id: { $in: serviceIds } }, "_id").lean();
      if (existing.length !== serviceIds.length) {
        const foundIds = existing.map((s) => s._id.toString());
        const missing = serviceIds.filter((sid) => !foundIds.includes(sid));
        return res.status(404).json({ message: `Services not found: ${missing.join(", ")}` });
      }
      pkg.services = serviceIds;
    }
    if (isActive !== undefined) pkg.isActive = isActive;

    await pkg.save(); // pre-save hook recalculates finalPrice

    return res.status(200).json({ message: "Package updated.", data: pkg });
  } catch (error) {
    console.error("updatePackage error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─── Admin: Soft-delete package ───────────────────────────────────────────────

/**
 * DELETE /api/packages/:id
 * Auth: admin only — soft delete (sets isActive: false)
 */
const deletePackage = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ message: "Invalid package ID." });

    const pkg = await ServicePackage.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );
    if (!pkg) return res.status(404).json({ message: "Package not found." });

    return res.status(200).json({ message: "Package deactivated successfully." });
  } catch (error) {
    console.error("deletePackage error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─── User: Book a package ──────────────────────────────────────────────────────

/**
 * POST /api/packages/:id/book
 * Body: { scheduledDate, notes? }
 * Auth: user
 */
const bookPackage = async (req, res) => {
  try {
    const { id } = req.params;
    const { scheduledDate, notes } = req.body;
    const userId = req.user._id;

    if (!isValidObjectId(id)) return res.status(400).json({ message: "Invalid package ID." });
    if (!scheduledDate) return res.status(400).json({ message: "scheduledDate is required." });

    const schedDate = new Date(scheduledDate);
    if (isNaN(schedDate) || schedDate < new Date()) {
      return res.status(400).json({ message: "scheduledDate must be a valid future date." });
    }

    const pkg = await ServicePackage.findOne({ _id: id, isActive: true });
    if (!pkg) return res.status(404).json({ message: "Package not found or inactive." });

    const booking = new PackageBooking({
      user: userId,
      package: pkg._id,
      amountPaid: pkg.finalPrice,
      scheduledDate: schedDate,
      notes: notes || "",
      status: "Pending",
    });

    await booking.save();

    return res.status(201).json({
      message: "Package booked successfully.",
      data: {
        bookingId: booking._id,
        package: pkg.name,
        amountPaid: pkg.finalPrice,
        scheduledDate: booking.scheduledDate,
        status: booking.status,
      },
    });
  } catch (error) {
    console.error("bookPackage error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * GET /api/packages/bookings/my
 * Returns all package bookings for the logged-in user.
 */
const getUserPackageBookings = async (req, res) => {
  try {
    const bookings = await PackageBooking.find({ user: req.user._id })
      .populate("package", "name description finalPrice services")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({ message: "Bookings fetched.", data: bookings });
  } catch (error) {
    console.error("getUserPackageBookings error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  createPackage,
  listPackages,
  getPackageById,
  updatePackage,
  deletePackage,
  bookPackage,
  getUserPackageBookings,
};

/**
 * Admin Controller
 * Handles all admin panel operations.
 * Grouped by section — handlers are added incrementally across tasks 3.1-3.10.
 */

const User = require("../models/User.js");
const Service = require("../models/Service.js");
const Notification = require("../models/Notification.js");
const Booking = require("../models/Booking.js");
const Payment = require("../models/PaymentStatus.js");
const ServiceCategory = require("../models/ServiceCategory.js");
const Review = require("../models/reviewSchema.js");
const SupportMessage = require("../models/SupportMessage.js");
const SystemSettings = require("../models/SystemSettings.js");
const nodemailer = require("nodemailer");

// --- Helpers ------------------------------------------------------------------

const VALID_ROLES = ["admin", "user", "service"];

// --- User Management ----------------------------------------------------------

/**
 * GET /api/admin/users
 * Paginated list of all users with optional search by username/email.
 * Query params: page (default 1), limit (default 10), search (optional)
 */
const getUserList = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const skip = (page - 1) * limit;

    const query = {};
    if (search) {
      const regex = new RegExp(search, "i");
      query.$or = [{ username: regex }, { email: regex }];
    }

    const [users, total] = await Promise.all([
      User.find(query)
        .populate("profileImage")
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(query),
    ]);

    const pages = Math.ceil(total / limit);

    return res.status(200).json({
      success: true,
      data: users,
      total,
      page,
      pages,
    });
  } catch (err) {
    console.error("getUserList error:", err);
    return res.status(500).json({ success: false, message: "Server Error", error: err.message });
  }
};

/**
 * PATCH /api/admin/users/:id/block
 * Toggle the isBlocked field for a user.
 * Guard: admin cannot block their own account.
 */
const blockUnblockUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user._id.toString() === id) {
      return res.status(400).json({ success: false, message: "Admin cannot block their own account" });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.isBlocked = !user.isBlocked;
    await user.save();

    const action = user.isBlocked ? "blocked" : "unblocked";

    return res.status(200).json({
      success: true,
      message: `User ${action}`,
      data: user,
    });
  } catch (err) {
    console.error("blockUnblockUser error:", err);
    return res.status(500).json({ success: false, message: "Server Error", error: err.message });
  }
};

/**
 * PATCH /api/admin/users/:id/role
 * Change a user's role. Body: { role }
 * Validates role against enum ["admin", "user", "service"].
 */
const changeUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role || !VALID_ROLES.includes(role)) {
      return res.status(400).json({
        success: false,
        message: `Invalid role. Must be one of: ${VALID_ROLES.join(", ")}`,
      });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Role updated",
      data: user,
    });
  } catch (err) {
    console.error("changeUserRole error:", err);
    return res.status(500).json({ success: false, message: "Server Error", error: err.message });
  }
};

/**
 * DELETE /api/admin/users/:id
 * Permanently delete a user.
 * Guard: admin cannot delete their own account.
 */
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user._id.toString() === id) {
      return res.status(400).json({ success: false, message: "Admin cannot delete their own account" });
    }

    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      message: "User deleted",
    });
  } catch (err) {
    console.error("deleteUser error:", err);
    return res.status(500).json({ success: false, message: "Server Error", error: err.message });
  }
};

// --- Vendor Management --------------------------------------------------------

/**
 * GET /api/admin/vendors
 * Paginated list of users with role === "service".
 * Query params: page (default 1), limit (default 10)
 */
const getVendorList = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = { role: "service" };

    const [vendors, total] = await Promise.all([
      User.find(query).skip(skip).limit(limit).lean(),
      User.countDocuments(query),
    ]);

    const pages = Math.ceil(total / limit);

    return res.status(200).json({
      success: true,
      data: vendors,
      total,
      page,
      pages,
    });
  } catch (err) {
    console.error("getVendorList error:", err);
    return res.status(500).json({ success: false, message: "Server Error", error: err.message });
  }
};

/**
 * PATCH /api/admin/vendors/:id/verify
 * Toggle isVerified on the vendor user.
 */
const verifyVendor = async (req, res) => {
  try {
    const { id } = req.params;
    const vendor = await User.findById(id);
    if (!vendor) {
      return res.status(404).json({ success: false, message: "Vendor not found" });
    }

    vendor.isVerified = !vendor.isVerified;
    await vendor.save();

    return res.status(200).json({
      success: true,
      message: vendor.isVerified ? "Vendor verified" : "Vendor verification revoked",
      data: vendor,
    });
  } catch (err) {
    console.error("verifyVendor error:", err);
    return res.status(500).json({ success: false, message: "Server Error", error: err.message });
  }
};

/**
 * PATCH /api/admin/vendors/:id/suspend
 * Toggle isBlocked on the vendor user (suspend / unsuspend).
 */
const suspendVendor = async (req, res) => {
  try {
    const { id } = req.params;
    const vendor = await User.findById(id);
    if (!vendor) {
      return res.status(404).json({ success: false, message: "Vendor not found" });
    }

    vendor.isBlocked = !vendor.isBlocked;
    await vendor.save();

    return res.status(200).json({
      success: true,
      message: vendor.isBlocked ? "Vendor suspended" : "Vendor unsuspended",
      data: vendor,
    });
  } catch (err) {
    console.error("suspendVendor error:", err);
    return res.status(500).json({ success: false, message: "Server Error", error: err.message });
  }
};

/**
 * PATCH /api/admin/services/:id/approval
 * Update a service's approvalStatus and notify the vendor.
 * Body: { status } — must be "approved" or "rejected"
 */
const VALID_APPROVAL_STATUSES = ["approved", "rejected"];

const updateServiceApproval = async (req, res) => {
  try {
    const { id } = req.params;
    const  status  = req.body.status;
    console.log(status)

    if (!status || !VALID_APPROVAL_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${VALID_APPROVAL_STATUSES.join(", ")}`,
      });
    }

    const service = await Service.findByIdAndUpdate(
      id,
      { approvalStatus: status },
      { new: true, runValidators: true }
    );

    if (!service) {
      return res.status(404).json({ success: false, message: "Service not found" });
    }

    await Notification.create({
      user: service.createdBy,
      type: "service",
      title: `Service ${status}`,
      message: `Your service "${service.name}" has been ${status} by admin.`,
    });

    return res.status(200).json({
      success: true,
      message: "Service approval updated",
      data: service,
    });
  } catch (err) {
    console.error("updateServiceApproval error:", err);
    return res.status(500).json({ success: false, message: "Server Error", error: err.message });
  }
};

/**
 * GET /api/admin/vendors/:id/services
 * List all services created by a specific vendor.
 */
const getVendorServices = async (req, res) => {
  try {
    const { id } = req.params;

    const services = await Service.find({ createdBy: id })
      .select("name description price duration category approvalStatus createdAt")
      .lean();

    return res.status(200).json({
      success: true,
      data: services,
    });
  } catch (err) {
    console.error("getVendorServices error:", err);
    return res.status(500).json({ success: false, message: "Server Error", error: err.message });
  }
};

// --- Bookings -----------------------------------------------------------------

/**
 * GET /api/admin/bookings
 * Reads bookings from Service.availableSlots (the actual booking store).
 * Query params: page, limit, status (Pending|Approved|Rejected|completed|failed), dateFrom, dateTo
 */
const History = require("../models/History.js");

const getAllBookings = async (req, res) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip  = (page - 1) * limit;

    const { status, dateFrom, dateTo } = req.query;

    // Pull all services with booked OR rejected slots
    // Note: Rejected slots have isBooked=false (slot freed) but bookingStatus="Rejected"
    const services = await Service.find({
      $or: [
        { "availableSlots.isBooked": true },
        { "availableSlots.bookingStatus": "Rejected" },
      ]
    })
      .populate("createdBy", "firstname lastname username email contact")
      .lean();

    // Flatten slots into booking-like objects
    let allBookings = [];
    for (const svc of services) {
      for (const slot of svc.availableSlots) {
        // Include: booked slots OR rejected slots (rejected = was booked, then rejected)
        const isRejected = slot.bookingStatus === "Rejected";
        if (!slot.isBooked && !isRejected) continue;

        // Map slot bookingStatus → display status
        const displayStatus =
          slot.bookingStatus === "Approved"  ? "Confirmed" :
          slot.bookingStatus === "Rejected"  ? "Cancelled" : "Pending";

        // Use ObjectId timestamp as reliable booking date (bookedAt can be null for rejected slots)
        let bookedAt = null;
        try { bookedAt = slot._id.getTimestamp(); } catch { bookedAt = null; }

        // Date range filter
        if (dateFrom && bookedAt && bookedAt < new Date(dateFrom)) continue;
        if (dateTo   && bookedAt && bookedAt > new Date(dateTo))   continue;

        // Status filter
        if (status && status !== "All") {
          if (status === "Confirmed" && slot.bookingStatus !== "Approved")  continue;
          if (status === "Cancelled" && slot.bookingStatus !== "Rejected")  continue;
          if (status === "Pending"   && slot.bookingStatus !== "pending")   continue;
        }

        allBookings.push({
          _id:      `${svc._id}_${slot._id}`,
          slotId:   slot._id,
          serviceId: {
            _id:       svc._id,
            name:      svc.name,
            category:  svc.category,
            price:     svc.price,
            duration:  svc.duration,
            description: svc.description,
            createdBy: svc.createdBy,
          },
          userId:   slot.bookedBy,   // ObjectId — will populate below
          date:     slot.date,
          slotTime: slot.time,
          status:   displayStatus,
          bookingStatus:         slot.bookingStatus,
          ServiceDeliveryStatus: slot.ServiceDeliveryStatus,
          createdAt: bookedAt,
        });
      }
    }

    // Sort newest first
    allBookings.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

    const total = allBookings.length;
    const pages = Math.ceil(total / limit) || 1;
    const paged = allBookings.slice(skip, skip + limit);

    // Populate user details for the page
    const userIds = [...new Set(paged.map(b => b.userId?.toString()).filter(Boolean))];
    const users   = await User.find({ _id: { $in: userIds } }, "firstname lastname username email contact").lean();
    const userMap = {};
    users.forEach(u => { userMap[u._id.toString()] = u; });

    const populated = paged.map(b => ({
      ...b,
      userId: b.userId ? (userMap[b.userId.toString()] || { _id: b.userId }) : null,
    }));

    return res.status(200).json({ success: true, data: populated, total, page, pages });
  } catch (err) {
    console.error("getAllBookings error:", err);
    return res.status(500).json({ success: false, message: "Server Error", error: err.message });
  }
};

/**
 * GET /api/admin/bookings/:id  — format: serviceId_slotId
 */
const getBookingDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const [serviceId, slotId] = id.split("_");

    const svc = await Service.findById(serviceId)
      .populate("createdBy", "firstname lastname username email contact city state")
      .lean();

    if (!svc) return res.status(404).json({ success: false, message: "Service not found" });

    const slot = svc.availableSlots.find(s => s._id.toString() === slotId);
    if (!slot) return res.status(404).json({ success: false, message: "Slot not found" });

    // Populate user — works for both booked and rejected slots (bookedBy is now preserved)
    let userDoc = null;
    if (slot.bookedBy) {
      userDoc = await User.findById(slot.bookedBy, "firstname lastname username email contact city state").lean();
    }

    const displayStatus =
      slot.bookingStatus === "Approved" ? "Confirmed" :
      slot.bookingStatus === "Rejected" ? "Cancelled" : "Pending";

    return res.status(200).json({
      success: true,
      data: {
        _id:      `${serviceId}_${slotId}`,
        status:   displayStatus,
        bookingStatus: slot.bookingStatus,
        ServiceDeliveryStatus: slot.ServiceDeliveryStatus,
        date:     slot.date,
        slotTime: slot.time,
        createdAt: slot.bookedAt,
        userId:   userDoc,
        serviceId: {
          _id:       svc._id,
          name:      svc.name,
          category:  svc.category,
          price:     svc.price,
          duration:  svc.duration,
          description: svc.description,
          createdBy: svc.createdBy,
        },
      },
    });
  } catch (err) {
    console.error("getBookingDetail error:", err);
    return res.status(500).json({ success: false, message: "Server Error", error: err.message });
  }
};

// --- Analytics ----------------------------------------------------------------

/**
 * GET /api/admin/analytics
 * Uses real data: Service.availableSlots for bookings, History for completions,
 * PaymentStatus for revenue.
 */
const getAnalytics = async (req, res) => {
  try {
    const dateFilter = {};
    if (req.query.dateFrom || req.query.dateTo) {
      dateFilter.createdAt = {};
      if (req.query.dateFrom) dateFilter.createdAt.$gte = new Date(req.query.dateFrom);
      if (req.query.dateTo)   dateFilter.createdAt.$lte = new Date(req.query.dateTo);
    }

    const yearStart = new Date(new Date().getFullYear(), 0, 1);

    // ── 1. Revenue from PaymentStatus ─────────────────────────────────────
    const revenueResult = await Payment.aggregate([
      { $match: { status: "success", ...dateFilter } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;

    const monthlyRevenueRaw = await Payment.aggregate([
      { $match: { status: "success", createdAt: { $gte: yearStart } } },
      { $group: { _id: { $month: "$createdAt" }, total: { $sum: "$amount" } } },
      { $sort: { _id: 1 } },
    ]);
    const monthlyRevenue = Array(12).fill(0);
    monthlyRevenueRaw.forEach(e => { monthlyRevenue[e._id - 1] = e.total; });

    // ── 2. Booking counts from Service.availableSlots ─────────────────────
    const allServices = await Service.find({}, "name category createdBy availableSlots createdAt").lean();

    let totalBookings = 0;
    const serviceBookingCount = {};  // serviceId → count
    const vendorBookingCount  = {};  // vendorId  → count
    const monthlyBookings     = Array(12).fill(0);
    const slotStatusCount     = { pending: 0, Approved: 0, Rejected: 0 };

    for (const svc of allServices) {
      for (const slot of svc.availableSlots) {
        if (!slot.isBooked) continue;

        // Use createdAt of the service as fallback if bookedAt is unreliable
        // bookedAt default was Date.now() evaluated once — use slot._id timestamp as reliable fallback
        let bookedDate = null;
        if (slot.bookedAt && slot.bookedAt instanceof Date) {
          bookedDate = slot.bookedAt;
        } else {
          // Extract timestamp from ObjectId as reliable creation time
          try {
            bookedDate = slot._id.getTimestamp();
          } catch {
            bookedDate = new Date(svc.createdAt);
          }
        }

        // Date filter
        if (dateFilter.createdAt) {
          if (dateFilter.createdAt.$gte && bookedDate < dateFilter.createdAt.$gte) continue;
          if (dateFilter.createdAt.$lte && bookedDate > dateFilter.createdAt.$lte) continue;
        }

        totalBookings++;

        // Monthly trend (current year) — use ObjectId timestamp for accuracy
        if (bookedDate && bookedDate >= yearStart) {
          monthlyBookings[bookedDate.getMonth()]++;
        }

        // Per-service count
        const sid = svc._id.toString();
        serviceBookingCount[sid] = (serviceBookingCount[sid] || 0) + 1;
        if (!serviceBookingCount[`name_${sid}`]) serviceBookingCount[`name_${sid}`] = svc.name;

        // Per-vendor count
        if (svc.createdBy) {
          const vid = svc.createdBy.toString();
          vendorBookingCount[vid] = (vendorBookingCount[vid] || 0) + 1;
        }

        // Slot status distribution
        const st = slot.bookingStatus || "pending";
        slotStatusCount[st] = (slotStatusCount[st] || 0) + 1;
      }
    }

    // Top 5 services
    const topServices = Object.entries(serviceBookingCount)
      .filter(([k]) => !k.startsWith("name_"))
      .map(([id, count]) => ({ _id: id, name: serviceBookingCount[`name_${id}`] || "Unknown", count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Top 5 vendors — need names
    const topVendorIds = Object.entries(vendorBookingCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id]) => id);

    const vendorDocs = await User.find(
      { _id: { $in: topVendorIds } },
      "firstname lastname username"
    ).lean();
    const vendorNameMap = {};
    vendorDocs.forEach(v => {
      vendorNameMap[v._id.toString()] =
        v.firstname ? `${v.firstname} ${v.lastname || ""}`.trim() : (v.username || "Unknown");
    });

    const topVendors = topVendorIds.map(id => ({
      _id: id,
      name: vendorNameMap[id] || "Unknown",
      count: vendorBookingCount[id],
    }));

    // Booking status distribution
    const bookingStatusDist = Object.entries(slotStatusCount)
      .filter(([, c]) => c > 0)
      .map(([status, count]) => ({
        status: status === "Approved" ? "Confirmed" : status === "Rejected" ? "Cancelled" : "Pending",
        count,
      }));

    // ── 3. Summary counts ─────────────────────────────────────────────────
    const [totalUsers, totalVendors, totalPayments] = await Promise.all([
      User.countDocuments({ role: "user", ...dateFilter }),
      User.countDocuments({ role: "service", ...dateFilter }),
      Payment.countDocuments({ status: "success", ...dateFilter }),
    ]);

    // ── 4. Monthly trends ─────────────────────────────────────────────────
    const monthlyTrend = async (Model, matchExtra = {}) => {
      const raw = await Model.aggregate([
        { $match: { createdAt: { $gte: yearStart }, ...matchExtra } },
        { $group: { _id: { $month: "$createdAt" }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]);
      const arr = Array(12).fill(0);
      raw.forEach(e => { arr[e._id - 1] = e.count; });
      return arr;
    };

    const [usersTrend, vendorsTrend, paymentsTrend] = await Promise.all([
      monthlyTrend(User, { role: "user" }),
      monthlyTrend(User, { role: "service" }),
      monthlyTrend(Payment, { status: "success" }),
    ]);

    // ── 5. Payment status distribution ────────────────────────────────────
    const paymentStatusRaw = await Payment.aggregate([
      { $match: { ...dateFilter } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);
    const paymentStatusDist = paymentStatusRaw.map(e => ({ status: e._id || "Unknown", count: e.count }));

    return res.status(200).json({
      success: true,
      data: {
        totalRevenue,
        monthlyRevenue,
        topServices,
        topVendors,
        summary: { totalUsers, totalVendors, totalBookings, totalPayments },
        trends: {
          users:    usersTrend,
          vendors:  vendorsTrend,
          bookings: monthlyBookings,
          payments: paymentsTrend,
        },
        bookingStatusDist,
        paymentStatusDist,
      },
    });
  } catch (err) {
    console.error("getAnalytics error:", err);
    return res.status(500).json({ success: false, message: "Server Error", error: err.message });
  }
};

// --- Category Management ------------------------------------------------------

/**
 * GET /api/admin/categories
 * List all service categories with service count per category.
 */
const getCategories = async (req, res) => {
  try {
    const categories = await ServiceCategory.find({ isActive: true })
      .populate("createdBy", "username email")
      .lean();

    // Get service count for each category
    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => {
        const serviceCount = await Service.countDocuments({ category: category.name });
        return {
          ...category,
          serviceCount,
        };
      })
    );

    return res.status(200).json({
      success: true,
      data: categoriesWithCount,
    });
  } catch (err) {
    console.error("getCategories error:", err);
    return res.status(500).json({ success: false, message: "Server Error", error: err.message });
  }
};

/**
 * POST /api/admin/categories
 * Create a new service category.
 * Body: { name }
 */
const createCategory = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Category name is required",
      });
    }

    // Check if category already exists
    const existingCategory = await ServiceCategory.findOne({ name: name.trim() });
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: "Category with this name already exists",
      });
    }

    const category = await ServiceCategory.create({
      name: name.trim(),
      createdBy: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: category,
    });
  } catch (err) {
    console.error("createCategory error:", err);
    return res.status(500).json({ success: false, message: "Server Error", error: err.message });
  }
};

/**
 * PUT /api/admin/categories/:id
 * Update (rename) a category and cascade the change to all services using it.
 * Body: { name }
 */
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Category name is required",
      });
    }

    const category = await ServiceCategory.findById(id);
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    const oldName = category.name;
    const newName = name.trim();

    // Check if new name already exists (and it's not the same category)
    const existingCategory = await ServiceCategory.findOne({ name: newName, _id: { $ne: id } });
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: "Category with this name already exists",
      });
    }

    // Update category name
    category.name = newName;
    await category.save();

    // Cascade rename to all services using the old category name
    const updateResult = await Service.updateMany(
      { category: oldName },
      { $set: { category: newName } }
    );

    return res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: category,
      servicesUpdated: updateResult.modifiedCount,
    });
  } catch (err) {
    console.error("updateCategory error:", err);
    return res.status(500).json({ success: false, message: "Server Error", error: err.message });
  }
};

/**
 * DELETE /api/admin/categories/:id
 * Delete a category. Blocked if any services are using it.
 */
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await ServiceCategory.findById(id);
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    // Check if any services are using this category
    const serviceCount = await Service.countDocuments({ category: category.name });
    if (serviceCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete: ${serviceCount} service${serviceCount > 1 ? 's' : ''} use this category. Reassign them first.`,
      });
    }

    await ServiceCategory.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (err) {
    console.error("deleteCategory error:", err);
    return res.status(500).json({ success: false, message: "Server Error", error: err.message });
  }
};

// --- Reviews Moderation -------------------------------------------------------

/**
 * GET /api/admin/reviews
 * Paginated list of all reviews with optional rating filter.
 * Query params: page (default 1), limit (default 10), rating (optional 1-5)
 * Populates reviewer (User) and service (Service) fields.
 */
const getReviews = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = {};

    // Optional rating filter (1-5)
    if (req.query.rating) {
      const rating = parseInt(req.query.rating);
      if (rating >= 1 && rating <= 5) {
        query.rating = rating;
      } else {
        return res.status(400).json({
          success: false,
          message: "Rating must be between 1 and 5",
        });
      }
    }

    const [reviews, total] = await Promise.all([
      Review.find(query)
        .populate("reviewer", "username email contact")
        .populate("service", "name category price")
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean(),
      Review.countDocuments(query),
    ]);

    const pages = Math.ceil(total / limit);

    return res.status(200).json({
      success: true,
      data: reviews,
      total,
      page,
      pages,
    });
  } catch (err) {
    console.error("getReviews error:", err);
    return res.status(500).json({ success: false, message: "Server Error", error: err.message });
  }
};

/**
 * DELETE /api/admin/reviews/:id
 * Permanently delete a review by ID.
 */
const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await Review.findByIdAndDelete(id);
    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Review deleted",
    });
  } catch (err) {
    console.error("deleteReview error:", err);
    return res.status(500).json({ success: false, message: "Server Error", error: err.message });
  }
};

// --- Payment Management -------------------------------------------------------

/**
 * GET /api/admin/payments
 * Paginated list of all payments with optional status filter.
 * Query params: page (default 1), limit (default 10), status (optional)
 * Populates user field.
 * Also returns summary cards: count + total amount per status.
 */
const getPayments = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = {};

    // Optional status filter
    if (req.query.status) {
      query.status = req.query.status;
    }

    const [payments, total] = await Promise.all([
      Payment.find(query)
        .populate("user", "username email contact")
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean(),
      Payment.countDocuments(query),
    ]);

    const pages = Math.ceil(total / limit);

    // Calculate summary cards: count + total amount per status
    const summaryRaw = await Payment.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalAmount: { $sum: "$amount" },
        },
      },
    ]);

    // Transform summary into object keyed by status
    const summary = {};
    summaryRaw.forEach((item) => {
      summary[item._id] = {
        count: item.count,
        totalAmount: item.totalAmount,
      };
    });

    return res.status(200).json({
      success: true,
      data: payments,
      total,
      page,
      pages,
      summary,
    });
  } catch (err) {
    console.error("getPayments error:", err);
    return res.status(500).json({ success: false, message: "Server Error", error: err.message });
  }
};

/**
 * PATCH /api/admin/payments/:id/refund
 * Mark a payment as refunded.
 * Guard: only payments with status "success" can be marked as refunded.
 */
const markRefunded = async (req, res) => {
  try {
    const { id } = req.params;

    const payment = await Payment.findById(id);
    if (!payment) {
      return res.status(404).json({ success: false, message: "Payment not found" });
    }

    // Guard: only success payments can be refunded
    if (payment.status !== "success") {
      return res.status(400).json({
        success: false,
        message: "Only payments with status 'success' can be marked as refunded",
      });
    }

    payment.status = "refunded";
    await payment.save();

    return res.status(200).json({
      success: true,
      message: "Payment marked as refunded",
      data: payment,
    });
  } catch (err) {
    console.error("markRefunded error:", err);
    return res.status(500).json({ success: false, message: "Server Error", error: err.message });
  }
};

// --- Reports & Export ---------------------------------------------------------

/**
 * Helper function to convert array of objects to CSV string
 * @param {Array} data - Array of objects to convert
 * @param {Array} headers - Array of header strings
 * @param {Function} rowMapper - Function to map each object to array of values
 * @returns {String} CSV string
 */
const arrayToCSV = (data, headers, rowMapper) => {
  const csvRows = [];
  
  // Add header row
  csvRows.push(headers.join(','));
  
  // Add data rows
  for (const item of data) {
    const values = rowMapper(item);
    // Escape values that contain commas or quotes
    const escapedValues = values.map(val => {
      const stringVal = val === null || val === undefined ? '' : String(val);
      if (stringVal.includes(',') || stringVal.includes('"') || stringVal.includes('\n')) {
        return `"${stringVal.replace(/"/g, '""')}"`;
      }
      return stringVal;
    });
    csvRows.push(escapedValues.join(','));
  }
  
  return csvRows.join('\n');
};

/**
 * GET /api/admin/export/bookings
 * Export bookings as CSV with optional date range filter.
 * Query params: dateFrom, dateTo (optional ISO date strings)
 * CSV columns: booking ID, user name, vendor name, service name, date, status
 */
const exportBookingsCSV = async (req, res) => {
  try {
    const query = {};

    // Optional date range filter
    if (req.query.dateFrom || req.query.dateTo) {
      query.createdAt = {};
      if (req.query.dateFrom) {
        query.createdAt.$gte = new Date(req.query.dateFrom);
      }
      if (req.query.dateTo) {
        query.createdAt.$lte = new Date(req.query.dateTo);
      }
    }

    const bookings = await Booking.find(query)
      .populate("userId", "username")
      .populate({
        path: "serviceId",
        select: "name createdBy",
        populate: { path: "createdBy", select: "username" },
      })
      .lean();

    const headers = ["Booking ID", "User Name", "Vendor Name", "Service Name", "Date", "Status"];
    
    const rowMapper = (booking) => [
      booking._id,
      booking.userId?.username || "N/A",
      booking.serviceId?.createdBy?.username || "N/A",
      booking.serviceId?.name || "N/A",
      booking.date ? new Date(booking.date).toISOString() : "N/A",
      booking.status,
    ];

    const csv = arrayToCSV(bookings, headers, rowMapper);

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=bookings.csv");
    return res.status(200).send(csv);
  } catch (err) {
    console.error("exportBookingsCSV error:", err);
    return res.status(500).json({ success: false, message: "Server Error", error: err.message });
  }
};

/**
 * GET /api/admin/export/payments
 * Export payments as CSV with optional date range filter.
 * Query params: dateFrom, dateTo (optional ISO date strings)
 * CSV columns: order ID, user name, amount, currency, method, status, date
 */
const exportPaymentsCSV = async (req, res) => {
  try {
    const query = {};

    // Optional date range filter
    if (req.query.dateFrom || req.query.dateTo) {
      query.createdAt = {};
      if (req.query.dateFrom) {
        query.createdAt.$gte = new Date(req.query.dateFrom);
      }
      if (req.query.dateTo) {
        query.createdAt.$lte = new Date(req.query.dateTo);
      }
    }

    const payments = await Payment.find(query)
      .populate("user", "username")
      .lean();

    const headers = ["Order ID", "User Name", "Amount", "Currency", "Method", "Status", "Date"];
    
    const rowMapper = (payment) => [
      payment.orderId,
      payment.user?.username || "N/A",
      payment.amount,
      payment.currency,
      payment.paymentMethod,
      payment.status,
      payment.createdAt ? new Date(payment.createdAt).toISOString() : "N/A",
    ];

    const csv = arrayToCSV(payments, headers, rowMapper);

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=payments.csv");
    return res.status(200).send(csv);
  } catch (err) {
    console.error("exportPaymentsCSV error:", err);
    return res.status(500).json({ success: false, message: "Server Error", error: err.message });
  }
};

/**
 * GET /api/admin/export/users
 * Export users as CSV with optional date range filter.
 * Query params: dateFrom, dateTo (optional ISO date strings)
 * CSV columns: username, firstname, lastname, email, role, city, state, contact
 */
const exportUsersCSV = async (req, res) => {
  try {
    const query = {};

    // Optional date range filter
    if (req.query.dateFrom || req.query.dateTo) {
      query.createdAt = {};
      if (req.query.dateFrom) {
        query.createdAt.$gte = new Date(req.query.dateFrom);
      }
      if (req.query.dateTo) {
        query.createdAt.$lte = new Date(req.query.dateTo);
      }
    }

    const users = await User.find(query).lean();

    const headers = ["Username", "First Name", "Last Name", "Email", "Role", "City", "State", "Contact"];
    
    const rowMapper = (user) => [
      user.username,
      user.firstname,
      user.lastname,
      user.email,
      user.role,
      user.city,
      user.state,
      user.contact,
    ];

    const csv = arrayToCSV(users, headers, rowMapper);

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=users.csv");
    return res.status(200).send(csv);
  } catch (err) {
    console.error("exportUsersCSV error:", err);
    return res.status(500).json({ success: false, message: "Server Error", error: err.message });
  }
};

// --- Support Messages ---------------------------------------------------------

/**
 * GET /api/admin/support
 * Paginated list of all support messages with unread count.
 * Query params: page (default 1), limit (default 10), countOnly (optional boolean)
 * If countOnly=true, returns only the unread count.
 */
const getSupportMessages = async (req, res) => {
  try {
    // If countOnly is requested, return just the unread count
    if (req.query.countOnly === "true") {
      const unreadCount = await SupportMessage.countDocuments({ status: "pending" });
      return res.status(200).json({
        success: true,
        unreadCount,
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [messages, total, unreadCount] = await Promise.all([
      SupportMessage.find()
        .populate("userId", "username email")
        .populate("repliedBy", "username email")
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean(),
      SupportMessage.countDocuments(),
      SupportMessage.countDocuments({ status: "pending" }),
    ]);

    const pages = Math.ceil(total / limit);

    return res.status(200).json({
      success: true,
      data: messages,
      total,
      page,
      pages,
      unreadCount,
    });
  } catch (err) {
    console.error("getSupportMessages error:", err);
    return res.status(500).json({ success: false, message: "Server Error", error: err.message });
  }
};

/**
 * POST /api/admin/support
 * Submit a new support message (public endpoint, no auth required).
 * Body: { senderName, senderEmail, subject, message, userId (optional) }
 */
const submitSupportMessage = async (req, res) => {
  try {
    const { senderName, senderEmail, subject, message, userId } = req.body;

    // Validate required fields
    if (!senderName || !senderEmail || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: "All fields are required: senderName, senderEmail, subject, message",
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(senderEmail)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    const supportMessage = await SupportMessage.create({
      senderName: senderName.trim(),
      senderEmail: senderEmail.trim(),
      subject: subject.trim(),
      message: message.trim(),
      userId: userId || null,
    });

    return res.status(201).json({
      success: true,
      message: "Support message submitted successfully",
      data: supportMessage,
    });
  } catch (err) {
    console.error("submitSupportMessage error:", err);
    return res.status(500).json({ success: false, message: "Server Error", error: err.message });
  }
};

/**
 * PATCH /api/admin/support/:id/reply
 * Reply to a support message, send email to sender, and mark as replied.
 * Body: { replyText }
 */
const replyToSupportMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { replyText } = req.body;

    if (!replyText || !replyText.trim()) {
      return res.status(400).json({
        success: false,
        message: "Reply text is required",
      });
    }

    const supportMessage = await SupportMessage.findById(id);
    if (!supportMessage) {
      return res.status(404).json({ success: false, message: "Support message not found" });
    }

    // Send email reply to the sender
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "sumanadasrh@gmail.com",
          pass: "solmjznddvlahtyx",
        },
      });

      const mailOptions = {
        from: `"CrowdSourced Local Source Support" <sumanadasrh@gmail.com>`,
        to: supportMessage.senderEmail,
        subject: `Re: ${supportMessage.subject}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
            <h2 style="color: #333; text-align: center;">CrowdSourced Local Source Support</h2>
            <p style="font-size: 16px; color: #555;">Hello ${supportMessage.senderName},</p>
            <p style="font-size: 16px; color: #555;">Thank you for contacting us. Here is our response to your inquiry:</p>
            <div style="background: #f9f9f9; padding: 15px; border-left: 4px solid #007bff; margin: 20px 0;">
              <p style="font-size: 14px; color: #666; margin: 0;"><strong>Your Message:</strong></p>
              <p style="font-size: 14px; color: #333; margin: 10px 0 0 0;">${supportMessage.message}</p>
            </div>
            <div style="background: #f0f8ff; padding: 15px; border-left: 4px solid #28a745; margin: 20px 0;">
              <p style="font-size: 14px; color: #666; margin: 0;"><strong>Our Response:</strong></p>
              <p style="font-size: 14px; color: #333; margin: 10px 0 0 0;">${replyText.trim()}</p>
            </div>
            <hr>
            <p style="font-size: 14px; text-align: center; color: #888;">If you have further questions, please feel free to contact us again.</p>
            <p style="font-size: 14px; text-align: center; color: #888;">Best regards,<br>CrowdSourced Local Source Team</p>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
      console.log("Support reply email sent successfully to:", supportMessage.senderEmail);
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      return res.status(500).json({
        success: false,
        message: "Email delivery failed. Message status remains pending.",
        error: emailError.message,
      });
    }

    // Update support message status
    supportMessage.status = "replied";
    supportMessage.replyText = replyText.trim();
    supportMessage.repliedAt = new Date();
    supportMessage.repliedBy = req.user._id;
    await supportMessage.save();

    return res.status(200).json({
      success: true,
      message: "Reply sent successfully",
      data: supportMessage,
    });
  } catch (err) {
    console.error("replyToSupportMessage error:", err);
    return res.status(500).json({ success: false, message: "Server Error", error: err.message });
  }
};

// --- System Settings ----------------------------------------------------------

/**
 * GET /api/admin/settings
 * Get system settings. Returns the single settings document or default values.
 */
const getSettings = async (req, res) => {
  try {
    // Find the single settings document (singleton pattern)
    let settings = await SystemSettings.findOne();

    // If no settings exist, return default values
    if (!settings) {
      settings = {
        commissionRate: 10,
        otpExpiryMinutes: 10,
        platformName: "CLSP Services",
        supportEmail: "",
        maintenanceMode: false,
      };
    }

    return res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (err) {
    console.error("getSettings error:", err);
    return res.status(500).json({ success: false, message: "Server Error", error: err.message });
  }
};

/**
 * PUT /api/admin/settings
 * Update system settings with validation.
 * Body: { commissionRate, otpExpiryMinutes, platformName, supportEmail, maintenanceMode }
 * Validates commissionRate (0-100) and otpExpiryMinutes (1-60).
 */
const updateSettings = async (req, res) => {
  try {
    const { commissionRate, otpExpiryMinutes, platformName, supportEmail, maintenanceMode } = req.body;

    // Validate commissionRate if provided
    if (commissionRate !== undefined) {
      const rate = parseFloat(commissionRate);
      if (isNaN(rate) || rate < 0 || rate > 100) {
        return res.status(400).json({
          success: false,
          message: "Commission rate must be between 0 and 100",
        });
      }
    }

    // Validate otpExpiryMinutes if provided
    if (otpExpiryMinutes !== undefined) {
      const minutes = parseInt(otpExpiryMinutes);
      if (isNaN(minutes) || minutes < 1 || minutes > 60) {
        return res.status(400).json({
          success: false,
          message: "OTP expiry minutes must be between 1 and 60",
        });
      }
    }

    // Build update object with only provided fields
    const updateData = {};
    if (commissionRate !== undefined) updateData.commissionRate = parseFloat(commissionRate);
    if (otpExpiryMinutes !== undefined) updateData.otpExpiryMinutes = parseInt(otpExpiryMinutes);
    if (platformName !== undefined) updateData.platformName = platformName.trim();
    if (supportEmail !== undefined) updateData.supportEmail = supportEmail.trim();
    if (maintenanceMode !== undefined) updateData.maintenanceMode = Boolean(maintenanceMode);
    updateData.updatedBy = req.user._id;

    // Use findOneAndUpdate with upsert to maintain singleton pattern
    const settings = await SystemSettings.findOneAndUpdate(
      {}, // Empty filter matches any document (or none)
      updateData,
      {
        new: true, // Return updated document
        upsert: true, // Create if doesn't exist
        runValidators: true, // Run schema validators
      }
    );

    return res.status(200).json({
      success: true,
      message: "Settings updated successfully",
      data: settings,
    });
  } catch (err) {
    console.error("updateSettings error:", err);
    return res.status(500).json({ success: false, message: "Server Error", error: err.message });
  }
};

// --- Public: Maintenance Mode Check ------------------------------------------

/**
 * GET /api/admin/maintenance-status
 * Public endpoint — returns whether maintenance mode is on.
 */
const getMaintenanceStatus = async (req, res) => {
  try {
    const settings = await SystemSettings.findOne({}).lean();
    return res.status(200).json({
      success: true,
      maintenanceMode: settings?.maintenanceMode ?? false,
    });
  } catch (err) {
    return res.status(200).json({ success: true, maintenanceMode: false });
  }
};

// --- Exports ------------------------------------------------------------------

module.exports = {
  getUserList,
  blockUnblockUser,
  changeUserRole,
  deleteUser,
  getVendorList,
  verifyVendor,
  suspendVendor,
  getVendorServices,
  updateServiceApproval,
  getAllBookings,
  getBookingDetail,
  getAnalytics,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getReviews,
  deleteReview,
  getPayments,
  markRefunded,
  exportBookingsCSV,
  exportPaymentsCSV,
  exportUsersCSV,
  getSupportMessages,
  submitSupportMessage,
  replyToSupportMessage,
  getSettings,
  updateSettings,
  getMaintenanceStatus,
};

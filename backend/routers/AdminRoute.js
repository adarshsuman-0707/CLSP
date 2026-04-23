const { Router } = require("express");
const route = Router();

const authMiddleware = require("../middleware/authmiddleware.js");
const adminMiddleware = require("../middleware/adminmiddleware.js");

const {
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
} = require("../adminController/AdminController.js");

// ── User Management ───────────────────────────────────────────────────────────
// GET    /api/admin/users              — paginated user list with search
route.get("/users", authMiddleware, adminMiddleware, getUserList);

// PATCH  /api/admin/users/:id/block    — block/unblock user
route.patch("/users/:id/block", authMiddleware, adminMiddleware, blockUnblockUser);

// PATCH  /api/admin/users/:id/role     — change user role
route.patch("/users/:id/role", authMiddleware, adminMiddleware, changeUserRole);

// DELETE /api/admin/users/:id          — delete user
route.delete("/users/:id", authMiddleware, adminMiddleware, deleteUser);

// ── Vendor Management ─────────────────────────────────────────────────────────
// GET    /api/admin/vendors            — paginated vendor list
route.get("/vendors", authMiddleware, adminMiddleware, getVendorList);

// PATCH  /api/admin/vendors/:id/verify — verify vendor
route.patch("/vendors/:id/verify", authMiddleware, adminMiddleware, verifyVendor);

// PATCH  /api/admin/vendors/:id/suspend — suspend vendor
route.patch("/vendors/:id/suspend", authMiddleware, adminMiddleware, suspendVendor);

// GET    /api/admin/vendors/:id/services — list services for a vendor
route.get("/vendors/:id/services", authMiddleware, adminMiddleware, getVendorServices);

// PATCH  /api/admin/services/:id/approval — approve/reject service
route.patch("/services/:id/approval", authMiddleware, adminMiddleware, updateServiceApproval);

// ── Bookings ──────────────────────────────────────────────────────────────────
// GET    /api/admin/bookings           — paginated bookings with filters
route.get("/bookings", authMiddleware, adminMiddleware, getAllBookings);

// GET    /api/admin/bookings/:id       — booking detail
route.get("/bookings/:id", authMiddleware, adminMiddleware, getBookingDetail);

// ── Analytics ─────────────────────────────────────────────────────────────────
// GET    /api/admin/analytics          — revenue & analytics dashboard
route.get("/analytics", authMiddleware, adminMiddleware, getAnalytics);

// ── Category Management ───────────────────────────────────────────────────────
// GET    /api/admin/categories         — list all categories
route.get("/categories", authMiddleware, adminMiddleware, getCategories);

// POST   /api/admin/categories         — create category
route.post("/categories", authMiddleware, adminMiddleware, createCategory);

// PUT    /api/admin/categories/:id     — rename category (cascades to services)
route.put("/categories/:id", authMiddleware, adminMiddleware, updateCategory);

// DELETE /api/admin/categories/:id     — delete category (blocked if services exist)
route.delete("/categories/:id", authMiddleware, adminMiddleware, deleteCategory);

// ── Reviews Moderation ────────────────────────────────────────────────────────
// GET    /api/admin/reviews            — paginated reviews with rating filter
route.get("/reviews", authMiddleware, adminMiddleware, getReviews);

// DELETE /api/admin/reviews/:id        — delete review
route.delete("/reviews/:id", authMiddleware, adminMiddleware, deleteReview);

// ── Payment Management ────────────────────────────────────────────────────────
// GET    /api/admin/payments           — paginated payments with status filter
route.get("/payments", authMiddleware, adminMiddleware, getPayments);

// PATCH  /api/admin/payments/:id/refund — mark payment as refunded
route.patch("/payments/:id/refund", authMiddleware, adminMiddleware, markRefunded);

// ── Reports & Export ──────────────────────────────────────────────────────────
// GET    /api/admin/export/bookings    — export bookings CSV
route.get("/export/bookings", authMiddleware, adminMiddleware, exportBookingsCSV);

// GET    /api/admin/export/payments    — export payments CSV
route.get("/export/payments", authMiddleware, adminMiddleware, exportPaymentsCSV);

// GET    /api/admin/export/users       — export users CSV
route.get("/export/users", authMiddleware, adminMiddleware, exportUsersCSV);

// ── Support Messages ──────────────────────────────────────────────────────────
// GET    /api/admin/support            — paginated support messages
route.get("/support", authMiddleware, adminMiddleware, getSupportMessages);

// POST   /api/admin/support            — submit support message (PUBLIC, no auth)
route.post("/support", submitSupportMessage);

// PATCH  /api/admin/support/:id/reply  — reply to support message
route.patch("/support/:id/reply", authMiddleware, adminMiddleware, replyToSupportMessage);

// ── System Settings ───────────────────────────────────────────────────────────
// GET    /api/admin/settings           — get system settings
route.get("/settings", authMiddleware, adminMiddleware, getSettings);

// PUT    /api/admin/settings           — update system settings
route.put("/settings", authMiddleware, adminMiddleware, updateSettings);

// GET    /api/admin/maintenance-status — public: check if maintenance mode is on
route.get("/maintenance-status", getMaintenanceStatus);

module.exports = route;

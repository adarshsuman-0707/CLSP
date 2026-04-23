const { Router } = require("express");
const route = Router();

const authMiddleware = require("../middleware/authmiddleware.js");
const adminMiddleware = require("../middleware/adminmiddleware.js");

const {
  createPackage,
  listPackages,
  getPackageById,
  updatePackage,
  deletePackage,
  bookPackage,
  getUserPackageBookings,
} = require("../packageController/Package.js");

// ── Admin routes ──────────────────────────────────────────────────────────────
// POST   /api/packages                — create a new package
route.post("/", authMiddleware, adminMiddleware, createPackage);

// PUT    /api/packages/:id            — update a package
route.put("/:id", authMiddleware, adminMiddleware, updatePackage);

// DELETE /api/packages/:id            — soft-delete a package
route.delete("/:id", authMiddleware, adminMiddleware, deletePackage);

// ── Public / user-facing ──────────────────────────────────────────────────────
// GET    /api/packages                — list all active packages
route.get("/", listPackages);

// GET    /api/packages/bookings/my    — user's own package bookings (must be before /:id)
route.get("/bookings/my", authMiddleware, getUserPackageBookings);

// GET    /api/packages/:id            — package details with included services
route.get("/:id", getPackageById);

// POST   /api/packages/:id/book       — book a package
route.post("/:id/book", authMiddleware, bookPackage);

module.exports = route;

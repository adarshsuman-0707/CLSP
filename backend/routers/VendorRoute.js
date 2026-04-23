const { Router } = require("express");
const route = Router();

const authMiddleware = require("../middleware/authmiddleware.js");
const serviceMiddleware = require("../middleware/servicemiddleware.js");

const {
  upsertVendorLocation,
  getNearbyVendors,
  addAvailabilitySlots,
  getVendorAvailability,
} = require("../vendorController/VendorLocation.js");

// ── Location management (vendor only) ────────────────────────────────────────
// PUT  /api/vendors/location          — set/update own geo-coordinates
route.put("/location", serviceMiddleware, upsertVendorLocation);

// POST /api/vendors/availability      — add available time slots
route.post("/availability", serviceMiddleware, addAvailabilitySlots);

// ── Public / user-facing ──────────────────────────────────────────────────────
// GET  /api/vendors/nearby?lat=&lng=&radius=&category=
route.get("/nearby", authMiddleware, getNearbyVendors);

// GET  /api/vendors/:vendorId/availability
route.get("/:vendorId/availability", authMiddleware, getVendorAvailability);

module.exports = route;

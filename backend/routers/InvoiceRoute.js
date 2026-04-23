const { Router } = require("express");
const route = Router();

const authMiddleware = require("../middleware/authmiddleware.js");

const {
  createInvoice,
  getInvoiceByBookingId,
  getUserInvoices,
  downloadInvoicePDF,
} = require("../invoiceController/Invoice.js");

// ── Invoice generation ────────────────────────────────────────────────────────
// POST /api/invoice/generate          — generate invoice for a booking
route.post("/generate", authMiddleware, createInvoice);

// ── Fetch invoices ────────────────────────────────────────────────────────────
// GET  /api/invoice/my                — all invoices for logged-in user
route.get("/my", authMiddleware, getUserInvoices);

// GET  /api/invoice/:bookingId        — invoice for a specific booking
route.get("/:bookingId", authMiddleware, getInvoiceByBookingId);

// ── PDF download ──────────────────────────────────────────────────────────────
// GET  /api/invoice/:bookingId/pdf    — download invoice as PDF
route.get("/:bookingId/pdf", authMiddleware, downloadInvoicePDF);

module.exports = route;

/**
 * Invoice Controller
 * Handles:
 *  - Auto-generate invoice after booking completion
 *  - GET invoice by booking ID
 *  - Download invoice as PDF
 *
 * GST is configurable via env: GST_PERCENTAGE (default 18)
 */

const Invoice = require("../models/Invoice.js");
const Booking = require("../models/Booking.js");
const PackageBooking = require("../models/PackageBooking.js");
const Service = require("../models/Service.js");
const ServicePackage = require("../models/ServicePackage.js");
const User = require("../models/User.js");
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");

// ─── PDF library (pdfkit — installed separately) ──────────────────────────────
let PDFDocument;
try {
  PDFDocument = require("pdfkit");
} catch {
  PDFDocument = null; // graceful degradation if not installed
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

/**
 * Generate a unique invoice number: INV-YYYYMMDD-XXXXXX
 * Uses a counter derived from current invoice count to ensure uniqueness.
 */
const generateInvoiceNumber = async () => {
  const today = new Date();
  const datePart = today.toISOString().slice(0, 10).replace(/-/g, ""); // YYYYMMDD
  const count = await Invoice.countDocuments();
  const seq = String(count + 1).padStart(6, "0");
  return `INV-${datePart}-${seq}`;
};

/**
 * Calculate GST amounts.
 * @param {number} subtotal - Amount before GST
 * @param {number} gstPct   - GST percentage (e.g. 18)
 * @returns {{ gstAmount: number, finalAmount: number }}
 */
const calculateGST = (subtotal, gstPct) => {
  const gstAmount = parseFloat(((subtotal * gstPct) / 100).toFixed(2));
  const finalAmount = parseFloat((subtotal + gstAmount).toFixed(2));
  return { gstAmount, finalAmount };
};

// ─── Create invoice (internal — called after booking completion) ───────────────

/**
 * Generates and saves an invoice for a completed booking.
 * Can be called internally from booking completion flow.
 *
 * @param {Object} options
 * @param {string} options.bookingId       - Booking._id (single service)
 * @param {string} options.packageBookingId - PackageBooking._id (package)
 * @param {string} options.userId
 * @returns {Promise<Invoice>}
 */
const generateInvoice = async ({ bookingId, packageBookingId, userId }) => {
  const gstPercentage = parseFloat(process.env.GST_PERCENTAGE || "18");

  let items = [];
  let totalAmount = 0;
  let bookingRef = null;
  let packageBookingRef = null;

  if (bookingId) {
    // ── Single service booking ────────────────────────────────────────────────
    const booking = await Booking.findById(bookingId).populate("serviceId").lean();
    if (!booking) throw new Error(`Booking not found: ${bookingId}`);

    const svc = booking.serviceId;
    const lineTotal = parseFloat((svc.price * 1).toFixed(2));
    items.push({
      serviceName: svc.name,
      price: svc.price,
      quantity: 1,
      lineTotal,
    });
    totalAmount = lineTotal;
    bookingRef = booking._id;
  } else if (packageBookingId) {
    // ── Package booking ───────────────────────────────────────────────────────
    const pkgBooking = await PackageBooking.findById(packageBookingId)
      .populate({ path: "package", populate: { path: "services", select: "name price" } })
      .lean();
    if (!pkgBooking) throw new Error(`PackageBooking not found: ${packageBookingId}`);

    const pkg = pkgBooking.package;
    pkg.services.forEach((svc) => {
      const lineTotal = parseFloat((svc.price * 1).toFixed(2));
      items.push({ serviceName: svc.name, price: svc.price, quantity: 1, lineTotal });
      totalAmount += lineTotal;
    });
    totalAmount = parseFloat(totalAmount.toFixed(2));
    packageBookingRef = pkgBooking._id;
  } else {
    throw new Error("Either bookingId or packageBookingId is required.");
  }

  const { gstAmount, finalAmount } = calculateGST(totalAmount, gstPercentage);
  const invoiceNumber = await generateInvoiceNumber();

  const invoice = new Invoice({
    invoiceNumber,
    booking: bookingRef,
    packageBooking: packageBookingRef,
    user: userId,
    items,
    totalAmount,
    gstPercentage,
    gstAmount,
    finalAmount,
    companyDetails: {
      name: process.env.COMPANY_NAME || "CLSP Services Pvt. Ltd.",
      address: process.env.COMPANY_ADDRESS || "",
      gstin: process.env.COMPANY_GSTIN || "",
      email: process.env.COMPANY_EMAIL || "",
      phone: process.env.COMPANY_PHONE || "",
    },
  });

  await invoice.save();
  return invoice;
};

/**
 * Generates invoice directly from a History document (service payment flow).
 * Used when payment is made for a completed service (History model).
 *
 * @param {Object} options
 * @param {Object} options.historyDoc - The History document (already fetched)
 * @param {string} options.userId
 * @returns {Promise<Invoice>}
 */
const generateInvoiceFromHistory = async ({ historyDoc, userId }) => {
  const gstPercentage = parseFloat(process.env.GST_PERCENTAGE || "18");

  // Check for duplicate invoice using historyServiceId stored in booking ref
  const existing = await Invoice.findOne({ historyService: historyDoc._id }).lean();
  if (existing) {
    console.log("Invoice already exists for history:", historyDoc._id);
    return existing;
  }

  const price = parseFloat(historyDoc.servicePrice || 0);
  const lineTotal = parseFloat(price.toFixed(2));

  const items = [{
    serviceName: historyDoc.serviceName || "Service",
    price,
    quantity: 1,
    lineTotal,
  }];

  const totalAmount = lineTotal;
  const { gstAmount, finalAmount } = calculateGST(totalAmount, gstPercentage);
  const invoiceNumber = await generateInvoiceNumber();

  const invoice = new Invoice({
    invoiceNumber,
    booking: null,
    packageBooking: null,
    historyService: historyDoc._id,
    user: userId,
    items,
    totalAmount,
    gstPercentage,
    gstAmount,
    finalAmount,
    companyDetails: {
      name: process.env.COMPANY_NAME || "CLSP Services Pvt. Ltd.",
      address: process.env.COMPANY_ADDRESS || "",
      gstin: process.env.COMPANY_GSTIN || "",
      email: process.env.COMPANY_EMAIL || "",
      phone: process.env.COMPANY_PHONE || "",
    },
  });

  await invoice.save();
  return invoice;
};

// ─── API: Generate invoice for a booking ──────────────────────────────────────

/**
 * POST /api/invoice/generate
 * Body: { bookingId? } OR { packageBookingId? }
 * Auth: user
 */
const createInvoice = async (req, res) => {
  try {
    const { bookingId, packageBookingId } = req.body;
    const userId = req.user._id;

    if (!bookingId && !packageBookingId) {
      return res.status(400).json({ message: "bookingId or packageBookingId is required." });
    }

    // Prevent duplicate invoices
    const existingQuery = bookingId
      ? { booking: bookingId }
      : { packageBooking: packageBookingId };

    const existing = await Invoice.findOne(existingQuery).lean();
    if (existing) {
      return res.status(409).json({
        message: "Invoice already exists for this booking.",
        data: existing,
      });
    }

    const invoice = await generateInvoice({ bookingId, packageBookingId, userId });

    return res.status(201).json({
      message: "Invoice generated successfully.",
      data: invoice,
    });
  } catch (error) {
    console.error("createInvoice error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─── API: Get invoice by booking ID ───────────────────────────────────────────

/**
 * GET /api/invoice/:bookingId
 * Returns invoice for a given booking (single service or package).
 * Auth: user (can only see own invoices) or admin
 */
const getInvoiceByBookingId = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user._id;
    const isAdmin = req.user.role === "admin";

    if (!isValidObjectId(bookingId)) {
      return res.status(400).json({ message: "Invalid booking ID." });
    }

    // Search in both booking and packageBooking fields
    const invoice = await Invoice.findOne({
      $or: [{ booking: bookingId }, { packageBooking: bookingId }],
    })
      .populate("user", "firstname lastname email contact address city state pincode")
      .populate("booking")
      .populate("packageBooking")
      .lean();

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found for this booking." });
    }

    // Authorization: user can only see their own invoice
    if (!isAdmin && invoice.user._id.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Access denied." });
    }

    return res.status(200).json({
      message: "Invoice fetched successfully.",
      data: invoice,
    });
  } catch (error) {
    console.error("getInvoiceByBookingId error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * GET /api/invoice/my
 * Returns all invoices for the logged-in user.
 */
const getUserInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({ message: "Invoices fetched.", data: invoices });
  } catch (error) {
    console.error("getUserInvoices error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─── API: Download invoice as PDF ─────────────────────────────────────────────

/**
 * GET /api/invoice/:bookingId/pdf
 * Streams a PDF invoice to the client.
 * Requires pdfkit: npm install pdfkit
 */
const downloadInvoicePDF = async (req, res) => {
  try {
    if (!PDFDocument) {
      return res.status(501).json({
        message: "PDF generation not available. Install pdfkit: npm install pdfkit",
      });
    }

    const { bookingId } = req.params;
    const userId = req.user._id;
    const isAdmin = req.user.role === "admin";

    if (!isValidObjectId(bookingId)) {
      return res.status(400).json({ message: "Invalid booking ID." });
    }

    const invoice = await Invoice.findOne({
      $or: [{ booking: bookingId }, { packageBooking: bookingId }],
    })
      .populate("user", "firstname lastname email contact address city state pincode")
      .lean();

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found." });
    }

    if (!isAdmin && invoice.user._id.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Access denied." });
    }

    // ── Build PDF ─────────────────────────────────────────────────────────────
    const doc = new PDFDocument({ margin: 50, size: "A4" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="invoice-${invoice.invoiceNumber}.pdf"`
    );
    doc.pipe(res);

    const { companyDetails: co, user: u } = invoice;

    // ── Header ────────────────────────────────────────────────────────────────
    doc.fontSize(22).font("Helvetica-Bold").text(co.name, { align: "center" });
    doc.fontSize(10).font("Helvetica").text(co.address, { align: "center" });
    doc.text(`GSTIN: ${co.gstin}  |  Email: ${co.email}  |  Phone: ${co.phone}`, {
      align: "center",
    });
    doc.moveDown();
    doc
      .moveTo(50, doc.y)
      .lineTo(545, doc.y)
      .strokeColor("#cccccc")
      .stroke();
    doc.moveDown(0.5);

    // ── Invoice meta ──────────────────────────────────────────────────────────
    doc.fontSize(14).font("Helvetica-Bold").text("TAX INVOICE", { align: "center" });
    doc.moveDown(0.5);

    doc.fontSize(10).font("Helvetica");
    doc.text(`Invoice No: ${invoice.invoiceNumber}`, 50);
    doc.text(`Date: ${new Date(invoice.createdAt).toLocaleDateString("en-IN")}`, 50);
    doc.moveDown();

    // ── Bill To ───────────────────────────────────────────────────────────────
    doc.fontSize(11).font("Helvetica-Bold").text("Bill To:");
    doc.fontSize(10).font("Helvetica");
    doc.text(`${u.firstname} ${u.lastname}`);
    doc.text(`Email: ${u.email}`);
    doc.text(`Phone: ${u.contact}`);
    doc.text(`Address: ${u.address || ""}, ${u.city || ""}, ${u.state || ""} - ${u.pincode || ""}`);
    doc.moveDown();

    // ── Items table ───────────────────────────────────────────────────────────
    doc
      .moveTo(50, doc.y)
      .lineTo(545, doc.y)
      .strokeColor("#000000")
      .stroke();
    doc.moveDown(0.3);

    // Table header
    doc.fontSize(10).font("Helvetica-Bold");
    doc.text("#", 50, doc.y, { width: 30 });
    doc.text("Service", 80, doc.y - doc.currentLineHeight(), { width: 250 });
    doc.text("Price", 330, doc.y - doc.currentLineHeight(), { width: 70, align: "right" });
    doc.text("Qty", 400, doc.y - doc.currentLineHeight(), { width: 40, align: "right" });
    doc.text("Total", 440, doc.y - doc.currentLineHeight(), { width: 100, align: "right" });
    doc.moveDown(0.3);

    doc
      .moveTo(50, doc.y)
      .lineTo(545, doc.y)
      .strokeColor("#cccccc")
      .stroke();
    doc.moveDown(0.3);

    // Table rows
    doc.font("Helvetica").fontSize(10);
    invoice.items.forEach((item, idx) => {
      const y = doc.y;
      doc.text(String(idx + 1), 50, y, { width: 30 });
      doc.text(item.serviceName, 80, y, { width: 250 });
      doc.text(`₹${item.price.toFixed(2)}`, 330, y, { width: 70, align: "right" });
      doc.text(String(item.quantity), 400, y, { width: 40, align: "right" });
      doc.text(`₹${item.lineTotal.toFixed(2)}`, 440, y, { width: 100, align: "right" });
      doc.moveDown(0.5);
    });

    doc
      .moveTo(50, doc.y)
      .lineTo(545, doc.y)
      .strokeColor("#cccccc")
      .stroke();
    doc.moveDown(0.5);

    // ── Totals ────────────────────────────────────────────────────────────────
    const totalsX = 350;
    doc.fontSize(10).font("Helvetica");
    doc.text("Sub-total:", totalsX, doc.y, { width: 100 });
    doc.text(`₹${invoice.totalAmount.toFixed(2)}`, totalsX + 100, doc.y - doc.currentLineHeight(), {
      width: 90,
      align: "right",
    });
    doc.moveDown(0.3);

    doc.text(`GST (${invoice.gstPercentage}%):`, totalsX, doc.y, { width: 100 });
    doc.text(`₹${invoice.gstAmount.toFixed(2)}`, totalsX + 100, doc.y - doc.currentLineHeight(), {
      width: 90,
      align: "right",
    });
    doc.moveDown(0.3);

    doc
      .moveTo(totalsX, doc.y)
      .lineTo(545, doc.y)
      .strokeColor("#000000")
      .stroke();
    doc.moveDown(0.3);

    doc.fontSize(12).font("Helvetica-Bold");
    doc.text("Total Payable:", totalsX, doc.y, { width: 100 });
    doc.text(`₹${invoice.finalAmount.toFixed(2)}`, totalsX + 100, doc.y - doc.currentLineHeight(), {
      width: 90,
      align: "right",
    });
    doc.moveDown(2);

    // ── Footer ────────────────────────────────────────────────────────────────
    doc
      .moveTo(50, doc.y)
      .lineTo(545, doc.y)
      .strokeColor("#cccccc")
      .stroke();
    doc.moveDown(0.5);
    doc
      .fontSize(9)
      .font("Helvetica")
      .fillColor("#888888")
      .text("This is a computer-generated invoice and does not require a signature.", {
        align: "center",
      });
    doc.text("Thank you for choosing CLSP Services!", { align: "center" });

    doc.end();
  } catch (error) {
    console.error("downloadInvoicePDF error:", error);
    if (!res.headersSent) {
      return res.status(500).json({ message: "Server error", error: error.message });
    }
  }
};

module.exports = {
  createInvoice,
  getInvoiceByBookingId,
  getUserInvoices,
  downloadInvoicePDF,
  generateInvoice,           // exported for internal use (package bookings)
  generateInvoiceFromHistory, // exported for internal use (service payments)
};

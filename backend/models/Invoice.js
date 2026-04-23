const mongoose = require("mongoose");

/**
 * InvoiceItem — line item inside an invoice.
 * Embedded sub-document (no separate collection needed).
 */
const invoiceItemSchema = new mongoose.Schema(
  {
    serviceName: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, default: 1, min: 1 },
    // line total = price * quantity
    lineTotal: { type: Number, required: true },
  },
  { _id: true }
);

/**
 * Invoice — generated after a booking/package booking is completed.
 * GST-ready: stores gst_percentage, gst_amount, and final_amount separately.
 */
const invoiceSchema = new mongoose.Schema(
  {
    // Unique human-readable invoice number e.g. INV-20260421-000042
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    // Reference to the booking (single service or package)
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      default: null,
      index: true,
    },
    // Reference to package booking (if applicable)
    packageBooking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PackageBooking",
      default: null,
    },
    // Reference to history service (for direct service payments)
    historyService: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HistoryServiceDoneStaus",
      default: null,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    // Line items breakdown
    items: {
      type: [invoiceItemSchema],
      validate: {
        validator: (v) => Array.isArray(v) && v.length > 0,
        message: "Invoice must have at least one item.",
      },
    },
    // Sub-total before GST
    totalAmount: { type: Number, required: true, min: 0 },
    // GST percentage applied (e.g. 18 for 18%)
    gstPercentage: { type: Number, default: 18, min: 0, max: 100 },
    // Computed GST amount
    gstAmount: { type: Number, required: true, min: 0 },
    // Final payable = totalAmount + gstAmount
    finalAmount: { type: Number, required: true, min: 0 },
    // Payment status
    isPaid: { type: Boolean, default: false },
    // PDF path (generated on demand)
    pdfPath: { type: String, default: null },
    // Company details snapshot (so invoice stays accurate even if config changes)
    companyDetails: {
      name: { type: String, default: "CLSP Services Pvt. Ltd." },
      address: { type: String, default: "" },
      gstin: { type: String, default: "" },
      email: { type: String, default: "" },
      phone: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

// Compound index for fast lookup by user + date
invoiceSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("Invoice", invoiceSchema);

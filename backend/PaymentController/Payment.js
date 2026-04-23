const Razorpay = require('razorpay');
const crypto = require('crypto');
const Payment = require('../models/PaymentStatus.js');
const HistoryService = require('../models/History.js');

let PDFDocument;
try { PDFDocument = require('pdfkit'); } catch { PDFDocument = null; }

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ✅ Create order
const MakePayment = async (req, res) => {
  try {
    const { amount, currency = "INR", receipt = "receipt#1" } = req.body;

    if (!amount) {
      return res.status(400).json({ success: false, message: "Amount required" });
    }

    console.log("🔹 Environment Keys Loaded:");
    console.log("RAZORPAY_KEY_ID:", process.env.RAZORPAY_KEY_ID);
    console.log("RAZORPAY_KEY_SECRET:", process.env.RAZORPAY_KEY_SECRET ? "✅ Loaded" : "❌ Missing");

    const options = {
      amount: amount,
      currency,
      receipt,
    };

    console.log("📦 Creating Razorpay Order with:", options);

    const order = await razorpay.orders.create(options);
    console.log("✅ Order Created Successfully:", order);

    return res.status(200).json({
      success: true,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("❌ Payment Order Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};


// ✅ Verify payment signature (after success)
const VerifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      ServiceId,        // History._id for service payments
      packageBookingId, // PackageBooking._id for package payments
      amount,
    } = req.body;

    // userId always comes from the authenticated token — never trust frontend
    const userId = req.user._id;

    console.log("🔹 VerifyPayment body:", { ServiceId, packageBookingId, amount, userId });

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      return res.status(400).json({ success: false, message: "Invalid signature" });
    }

    // ── Save payment record ───────────────────────────────────────────────────
    await SavePaymentDetails({
      user: userId,
      orderId: razorpay_order_id,
      amount,
      status: "success",
      paymentResponse: { razorpay_order_id, razorpay_payment_id, razorpay_signature },
    });

    // ── Handle service (History) payment ─────────────────────────────────────
    if (ServiceId) {
      const historyDoc = await HistoryService.findByIdAndUpdate(
        ServiceId,
        { $set: { paymentStatus: true } },
        { new: true }
      );
      if (!historyDoc) {
        return res.status(404).json({ success: false, message: "Service history not found" });
      }

      // Generate invoice from History data directly (no Booking model needed)
      try {
        const { generateInvoiceFromHistory } = require('../invoiceController/Invoice.js');
        await generateInvoiceFromHistory({ historyDoc, userId });
        console.log("✅ Invoice generated for service history:", ServiceId);
      } catch (invoiceError) {
        console.error("⚠️ Invoice generation failed (service):", invoiceError.message);
      }
    }

    // ── Handle package booking payment ────────────────────────────────────────
    if (packageBookingId) {
      const PackageBooking = require('../models/PackageBooking.js');
      const updatedBooking = await PackageBooking.findByIdAndUpdate(
        packageBookingId,
        { $set: { paymentStatus: true, status: 'Confirmed' } },
        { new: true }
      );
      if (!updatedBooking) {
        return res.status(404).json({ success: false, message: "Package booking not found" });
      }

      try {
        const { generateInvoice } = require('../invoiceController/Invoice.js');
        await generateInvoice({ packageBookingId, userId });
        console.log("✅ Invoice generated for package booking:", packageBookingId);
      } catch (invoiceError) {
        console.error("⚠️ Invoice generation failed (package):", invoiceError.message);
      }
    }

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      invoiceGenerated: true,
    });

  } catch (error) {
    console.error("❌ Verification Error:", error);
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};
const SavePaymentDetails = async (body) => {
  try {
    const { user, orderId, amount, currency, paymentMethod, status, paymentGateway, paymentResponse } = body;

    // if (!user || !orderId || !amount) {
    //   return res.status(400).json({ error: "user, orderId and amount are required" });
    // }

    // Create new payment
    const payment = new Payment({
      user,
      orderId,
      amount,
      currency: currency || "INR",
      paymentMethod: paymentMethod || "card",
      status: status || "created",
      paymentGateway: paymentGateway || "Razorpay",
      paymentResponse: paymentResponse || {}
    });

    await payment.save();
    // res.status(201).json({ success: true, payment: savedPayment });

  } catch (error) {
    console.error(error);
    // res.status(500).json({ success: false, error: "Server Error" });
  }
}

const GetPaymentDetail = async (req, res) => {
  try {
    const userId = req.user._id;
    const isAdmin = req.user.role === 'admin';

    // Users see only their own payments; admin sees all
    const query = isAdmin ? {} : { user: userId };

    const payments = await Payment.find(query)
      .populate('user', 'firstname lastname email contact')
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, payments });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// ── Download single payment receipt as PDF ────────────────────────────────────
const DownloadPaymentPDF = async (req, res) => {
  try {
    if (!PDFDocument) {
      return res.status(501).json({ message: 'PDF generation not available. Install pdfkit.' });
    }

    const { paymentId } = req.params;
    const userId = req.user._id;
    const isAdmin = req.user.role === 'admin';

    const pmt = await Payment.findById(paymentId)
      .populate('user', 'firstname lastname email contact address city state pincode')
      .lean();

    if (!pmt) return res.status(404).json({ message: 'Payment not found.' });
    if (!isAdmin && pmt.user._id.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="receipt-${pmt.orderId}.pdf"`);
    doc.pipe(res);

    const co = {
      name: process.env.COMPANY_NAME || 'CLSP Services Pvt. Ltd.',
      address: process.env.COMPANY_ADDRESS || '',
      gstin: process.env.COMPANY_GSTIN || '',
      email: process.env.COMPANY_EMAIL || '',
      phone: process.env.COMPANY_PHONE || '',
    };
    const u = pmt.user;

    // ── Header ────────────────────────────────────────────────────────────────
    doc.fontSize(22).font('Helvetica-Bold').text(co.name, { align: 'center' });
    doc.fontSize(10).font('Helvetica').text(co.address, { align: 'center' });
    doc.text(`GSTIN: ${co.gstin}  |  Email: ${co.email}  |  Phone: ${co.phone}`, { align: 'center' });
    doc.moveDown();
    doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#cccccc').stroke();
    doc.moveDown(0.5);

    // ── Title ─────────────────────────────────────────────────────────────────
    doc.fontSize(16).font('Helvetica-Bold').text('PAYMENT RECEIPT', { align: 'center' });
    doc.moveDown(0.5);

    // ── Status banner ─────────────────────────────────────────────────────────
    const isSuccess = pmt.status === 'success';
    doc.fontSize(12).font('Helvetica-Bold')
      .fillColor(isSuccess ? '#16a34a' : '#dc2626')
      .text(`Status: ${pmt.status.toUpperCase()}`, { align: 'center' });
    doc.fillColor('#000000').moveDown();

    // ── Receipt meta ──────────────────────────────────────────────────────────
    doc.fontSize(10).font('Helvetica');
    doc.text(`Order ID:      ${pmt.orderId}`, 50);
    doc.text(`Payment ID:    ${pmt.paymentResponse?.razorpay_payment_id || 'N/A'}`, 50);
    doc.text(`Date:          ${new Date(pmt.createdAt).toLocaleString('en-IN')}`, 50);
    doc.text(`Gateway:       ${pmt.paymentGateway || 'Razorpay'}`, 50);
    doc.text(`Method:        ${pmt.paymentMethod || 'card'}`, 50);
    doc.text(`Currency:      ${pmt.currency || 'INR'}`, 50);
    doc.moveDown();

    // ── Bill To ───────────────────────────────────────────────────────────────
    doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#cccccc').stroke();
    doc.moveDown(0.5);
    doc.fontSize(11).font('Helvetica-Bold').text('Bill To:');
    doc.fontSize(10).font('Helvetica');
    doc.text(`${u.firstname} ${u.lastname}`);
    doc.text(`Email: ${u.email}`);
    doc.text(`Phone: ${u.contact || 'N/A'}`);
    if (u.address) doc.text(`Address: ${u.address}, ${u.city || ''}, ${u.state || ''} - ${u.pincode || ''}`);
    doc.moveDown();

    // ── Amount box ────────────────────────────────────────────────────────────
    doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#000000').stroke();
    doc.moveDown(0.5);
    doc.fontSize(14).font('Helvetica-Bold').text('Amount Paid:', 50, doc.y, { width: 250 });
    doc.fontSize(18).font('Helvetica-Bold')
      .fillColor(isSuccess ? '#16a34a' : '#dc2626')
      .text(`₹${Number(pmt.amount).toLocaleString('en-IN')}`, 300, doc.y - doc.currentLineHeight(), { width: 245, align: 'right' });
    doc.fillColor('#000000').moveDown(2);

    // ── Footer ────────────────────────────────────────────────────────────────
    doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#cccccc').stroke();
    doc.moveDown(0.5);
    doc.fontSize(9).font('Helvetica').fillColor('#888888')
      .text('This is a computer-generated receipt and does not require a signature.', { align: 'center' });
    doc.text('Thank you for choosing CLSP Services!', { align: 'center' });

    doc.end();
  } catch (error) {
    console.error('DownloadPaymentPDF error:', error);
    if (!res.headersSent) res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { MakePayment, VerifyPayment, GetPaymentDetail, DownloadPaymentPDF };

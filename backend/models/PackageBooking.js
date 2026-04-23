const mongoose = require("mongoose");

/**
 * PackageBooking — booking record when a user books a service package
 * (as opposed to a single service via the existing Booking model).
 */
const packageBookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    package: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ServicePackage",
      required: true,
    },
    // Snapshot of price at time of booking (package price may change later)
    amountPaid: {
      type: Number,
      required: true,
    },
    scheduledDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Cancelled", "Completed"],
      default: "Pending",
    },
    paymentStatus: {
      type: Boolean,
      default: false,
    },
    notes: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

packageBookingSchema.index({ user: 1, status: 1 });

module.exports = mongoose.model("PackageBooking", packageBookingSchema);

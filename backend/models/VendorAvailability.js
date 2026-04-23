const mongoose = require("mongoose");

/**
 * VendorAvailability — stores time slots when a vendor is available.
 * Used to filter vendors available within the next N hours.
 */
const vendorAvailabilitySchema = new mongoose.Schema(
  {
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    // Slot start time (UTC)
    startTime: {
      type: Date,
      required: true,
      index: true,
    },
    // Slot end time (UTC)
    endTime: {
      type: Date,
      required: true,
    },
    isBooked: {
      type: Boolean,
      default: false,
    },
    // Optional: which booking consumed this slot
    bookingRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      default: null,
    },
  },
  { timestamps: true }
);

// Compound index: quickly find available slots for a vendor in a time range
vendorAvailabilitySchema.index({ vendor: 1, startTime: 1, isBooked: 1 });

module.exports = mongoose.model("VendorAvailability", vendorAvailabilitySchema);

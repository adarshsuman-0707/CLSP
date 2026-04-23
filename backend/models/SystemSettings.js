const mongoose = require("mongoose");

const systemSettingsSchema = new mongoose.Schema(
  {
    commissionRate: {
      type: Number,
      min: 0,
      max: 100,
      default: 10,
    },
    otpExpiryMinutes: {
      type: Number,
      default: 10,
      min: 1,
      max: 60,
    },
    platformName: {
      type: String,
      default: "CLSP Services",
      trim: true,
    },
    supportEmail: {
      type: String,
      default: "",
      trim: true,
    },
    maintenanceMode: {
      type: Boolean,
      default: false,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

// Singleton pattern — only one settings document ever exists.
// Controller uses: findOneAndUpdate({}, data, { upsert: true, new: true })
module.exports = mongoose.model("SystemSettings", systemSettingsSchema);

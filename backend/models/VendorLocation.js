const mongoose = require("mongoose");

/**
 * VendorLocation — stores geo-coordinates and availability for a service provider.
 * Linked 1-to-1 with User (role: "service").
 * Uses MongoDB 2dsphere index for geospatial queries.
 */
const vendorLocationSchema = new mongoose.Schema(
  {
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // one location doc per vendor
      index: true,
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
        required: true,
      },
      coordinates: {
        // GeoJSON format: [longitude, latitude]
        type: [Number],
        required: true,
        validate: {
          validator: function (coords) {
            if (!Array.isArray(coords) || coords.length !== 2) return false;
            const [lng, lat] = coords;
            return lng >= -180 && lng <= 180 && lat >= -90 && lat <= 90;
          },
          message: "Invalid coordinates. Must be [longitude, latitude] within valid ranges.",
        },
      },
    },
    // Human-readable address (optional, for display)
    address: { type: String, default: "" },
    // Service radius the vendor is willing to travel (km)
    serviceRadius: { type: Number, default: 10 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// 2dsphere index enables $geoNear, $near, $geoWithin queries
vendorLocationSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("VendorLocation", vendorLocationSchema);

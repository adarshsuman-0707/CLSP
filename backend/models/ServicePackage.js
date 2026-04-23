const mongoose = require("mongoose");

/**
 * ServicePackage — admin-created bundles of multiple services.
 * e.g. "Full Home Maintenance Package", "AC + Fridge Combo"
 */
const servicePackageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    // Base price before discount
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    // Discount percentage (0–100)
    discountPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    // Computed: price after discount (stored for quick reads)
    finalPrice: {
      type: Number,
      default: 0,
    },
    // Services included in this package (package_services mapping)
    services: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Service",
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Auto-compute finalPrice before save
servicePackageSchema.pre("save", function (next) {
  this.finalPrice = parseFloat(
    (this.price - (this.price * this.discountPercentage) / 100).toFixed(2)
  );
  next();
});

// Index for listing active packages quickly
servicePackageSchema.index({ isActive: 1, createdAt: -1 });

module.exports = mongoose.model("ServicePackage", servicePackageSchema);

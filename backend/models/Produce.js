const mongoose = require("mongoose");

const produceSchema = new mongoose.Schema(
  {
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, "Produce name is required"],
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      maxlength: 1000,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String, required: true },
      },
    ],
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    unit: {
      type: String,
      required: [true, "Unit is required"],
      enum: ["kg", "gram", "dozen", "piece", "litre", "bundle"],
    },
    quantityAvailable: {
      type: Number,
      required: [true, "Quantity is required"],
      min: 0,
    },
    minimumOrder: { type: Number, default: 1 },

    // Freshness and quality
    harvestDate: { type: Date },
    shelfLife: { type: Number }, // days
    isOrganic: { type: Boolean, default: false },
    growingMethod: {
      type: String,
      enum: ["organic", "natural", "hydroponic", "conventional"],
      default: "conventional",
    },

    // Geolocation
    location: {
      type: { type: String, enum: ["Point"] },
      coordinates: { type: [Number] }, // [lng, lat]
    },

    // Status
    isAvailable: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },

    // Ratings (aggregated from reviews)
    averageRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },

    // Search tags
    tags: [{ type: String }],
  },
  { timestamps: true }
);

// Indexes
produceSchema.index({ location: "2dsphere" }, { sparse: true });
produceSchema.index({ name: "text", description: "text", tags: "text" });
produceSchema.index({ category: 1, isAvailable: 1, createdAt: -1 });
produceSchema.index({ farmer: 1, isAvailable: 1 });

module.exports = mongoose.model("Produce", produceSchema);

const mongoose = require("mongoose");

const deliverySchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    deliveryAgent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["assigned", "accepted", "picked_up", "in_transit", "delivered", "cancelled"],
      default: "assigned",
    },
    pickupLocation: {
      address: { type: String },
      coordinates: {
        type: { type: String, enum: ["Point"] },
        coordinates: { type: [Number] },
      },
    },
    dropoffLocation: {
      address: { type: String },
      coordinates: {
        type: { type: String, enum: ["Point"] },
        coordinates: { type: [Number] },
      },
    },
    distance: { type: Number }, // in km
    estimatedTime: { type: Number }, // in minutes
    actualTime: { type: Number },
    earnings: { type: Number, default: 0 },

    // Timestamps for each step
    acceptedAt: { type: Date },
    pickedUpAt: { type: Date },
    deliveredAt: { type: Date },
  },
  { timestamps: true }
);

deliverySchema.index({ deliveryAgent: 1, status: 1 });
deliverySchema.index({ order: 1 });
deliverySchema.index({ "pickupLocation.coordinates": "2dsphere" }, { sparse: true });

module.exports = mongoose.model("Delivery", deliverySchema);

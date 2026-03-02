const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    produce: { type: mongoose.Schema.Types.ObjectId, ref: "Produce" },
    farmer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    name: { type: String, required: true },
    image: { type: String },
    price: { type: Number, required: true },
    unit: { type: String },
    quantity: { type: Number, required: true },
    subtotal: { type: Number, required: true },
  },
  { _id: false }
);

const statusHistorySchema = new mongoose.Schema(
  {
    status: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    note: { type: String },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, unique: true },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [orderItemSchema],
    deliveryAgent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    status: {
      type: String,
      enum: [
        "placed",
        "confirmed",
        "preparing",
        "ready_for_pickup",
        "picked_up",
        "in_transit",
        "delivered",
        "cancelled",
      ],
      default: "placed",
    },
    statusHistory: [statusHistorySchema],

    // Address snapshot
    deliveryAddress: {
      street: String,
      city: String,
      state: String,
      pincode: String,
    },

    // Pricing
    itemsTotal: { type: Number, required: true },
    deliveryFee: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },

    // Payment
    paymentMethod: {
      type: String,
      enum: ["cod", "upi", "card", "wallet"],
      default: "cod",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    paymentId: { type: String },

    // Notes
    customerNote: { type: String, maxlength: 500 },
    cancellationReason: { type: String },

    // Timing
    estimatedDelivery: { type: Date },
    deliveredAt: { type: Date },
  },
  { timestamps: true }
);

// Auto-generate order number
orderSchema.pre("save", async function () {
  if (this.isNew) {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const count = await this.constructor.countDocuments();
    this.orderNumber = `FF-${date}-${String(count + 1).padStart(4, "0")}`;
    this.statusHistory.push({ status: "placed", note: "Order placed" });
  }
});

orderSchema.index({ customer: 1, createdAt: -1 });
orderSchema.index({ "items.farmer": 1, status: 1 });
orderSchema.index({ deliveryAgent: 1, status: 1 });

module.exports = mongoose.model("Order", orderSchema);

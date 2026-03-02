const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema(
  {
    produce: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Produce",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    priceAtAdd: {
      type: Number,
      required: true,
    },
  },
  { _id: true }
);

const cartSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    items: [cartItemSchema],
    totalAmount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Recalculate total before save
cartSchema.pre("save", function (next) {
  this.totalAmount = this.items.reduce(
    (sum, item) => sum + item.priceAtAdd * item.quantity,
    0
  );
  next();
});

module.exports = mongoose.model("Cart", cartSchema);

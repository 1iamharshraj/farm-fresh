const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    produce: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Produce",
    },
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      maxlength: 1000,
    },
    isVerified: {
      type: Boolean,
      default: true, // All reviews come from completed orders
    },
  },
  { timestamps: true }
);

// Prevent duplicate reviews per order
reviewSchema.index({ customer: 1, order: 1 }, { unique: true });
reviewSchema.index({ farmer: 1, createdAt: -1 });
reviewSchema.index({ produce: 1, createdAt: -1 });

// Update farmer's average rating after save
reviewSchema.post("save", async function () {
  const Review = this.constructor;
  const stats = await Review.aggregate([
    { $match: { farmer: this.farmer } },
    {
      $group: {
        _id: "$farmer",
        averageRating: { $avg: "$rating" },
        totalRatings: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    await mongoose.model("User").findByIdAndUpdate(this.farmer, {
      averageRating: Math.round(stats[0].averageRating * 10) / 10,
      totalRatings: stats[0].totalRatings,
    });
  }

  // Also update produce rating if produce is specified
  if (this.produce) {
    const produceStats = await Review.aggregate([
      { $match: { produce: this.produce } },
      {
        $group: {
          _id: "$produce",
          averageRating: { $avg: "$rating" },
          totalRatings: { $sum: 1 },
        },
      },
    ]);

    if (produceStats.length > 0) {
      await mongoose.model("Produce").findByIdAndUpdate(this.produce, {
        averageRating: Math.round(produceStats[0].averageRating * 10) / 10,
      });
    }
  }
});

module.exports = mongoose.model("Review", reviewSchema);

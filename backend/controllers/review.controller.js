const Review = require("../models/Review");
const Order = require("../models/Order");
const { createNotification } = require("./notification.controller");

// @desc    Submit a review (post-delivery only)
// @route   POST /api/reviews
// @access  Customer
exports.submitReview = async (req, res, next) => {
  try {
    const { orderId, rating, comment, produceId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (order.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    if (order.status !== "delivered") {
      return res.status(400).json({
        success: false,
        message: "Can only review delivered orders",
      });
    }

    // Get the farmer from the order items
    const farmerId = order.items[0]?.farmer;
    if (!farmerId) {
      return res.status(400).json({ success: false, message: "No farmer found for this order" });
    }

    // Check for duplicate review
    const existing = await Review.findOne({ customer: req.user._id, order: orderId });
    if (existing) {
      return res.status(400).json({ success: false, message: "You already reviewed this order" });
    }

    const review = await Review.create({
      customer: req.user._id,
      produce: produceId || order.items[0]?.produce,
      farmer: farmerId,
      order: orderId,
      rating,
      comment,
    });

    await review.populate("customer", "name");

    // Notify farmer
    createNotification({
      recipient: farmerId,
      type: "new_review",
      title: "New Review",
      message: `${req.user.name} gave you ${rating} stars`,
      data: { orderId, reviewId: review._id },
    });

    res.status(201).json({
      success: true,
      message: "Review submitted",
      data: review,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: "You already reviewed this order" });
    }
    next(error);
  }
};

// @desc    Get reviews for a farmer
// @route   GET /api/reviews/farmer/:id
// @access  Public
exports.getFarmerReviews = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const [reviews, total] = await Promise.all([
      Review.find({ farmer: req.params.id })
        .populate("customer", "name")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit)),
      Review.countDocuments({ farmer: req.params.id }),
    ]);

    // Calculate rating distribution
    const distribution = await Review.aggregate([
      { $match: { farmer: new (require("mongoose").Types.ObjectId)(req.params.id) } },
      { $group: { _id: "$rating", count: { $sum: 1 } } },
      { $sort: { _id: -1 } },
    ]);

    res.status(200).json({
      success: true,
      data: reviews,
      distribution,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get reviews for a produce item
// @route   GET /api/reviews/produce/:id
// @access  Public
exports.getProduceReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ produce: req.params.id })
      .populate("customer", "name")
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({ success: true, data: reviews });
  } catch (error) {
    next(error);
  }
};

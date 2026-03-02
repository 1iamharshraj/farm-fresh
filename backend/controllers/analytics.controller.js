const Order = require("../models/Order");
const Produce = require("../models/Produce");
const Delivery = require("../models/Delivery");
const Review = require("../models/Review");
const mongoose = require("mongoose");

// @desc    Farmer sales analytics
// @route   GET /api/analytics/farmer
// @access  Farmer
exports.getFarmerAnalytics = async (req, res, next) => {
  try {
    const farmerId = req.user._id;
    const { period = "month" } = req.query;

    let startDate;
    const now = new Date();
    if (period === "week") {
      startDate = new Date(now.setDate(now.getDate() - 7));
    } else if (period === "month") {
      startDate = new Date(now.setMonth(now.getMonth() - 1));
    } else if (period === "year") {
      startDate = new Date(now.setFullYear(now.getFullYear() - 1));
    } else {
      startDate = new Date(0);
    }

    // Revenue and order stats
    const orderStats = await Order.aggregate([
      {
        $match: {
          "items.farmer": farmerId,
          status: { $ne: "cancelled" },
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" },
          totalOrders: { $sum: 1 },
          avgOrderValue: { $avg: "$totalAmount" },
        },
      },
    ]);

    // Orders by status
    const ordersByStatus = await Order.aggregate([
      { $match: { "items.farmer": farmerId, createdAt: { $gte: startDate } } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    // Daily revenue (last 7 days)
    const dailyRevenue = await Order.aggregate([
      {
        $match: {
          "items.farmer": farmerId,
          status: "delivered",
          createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: "$totalAmount" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Top products
    const topProducts = await Order.aggregate([
      { $match: { "items.farmer": farmerId, status: "delivered" } },
      { $unwind: "$items" },
      { $match: { "items.farmer": farmerId } },
      {
        $group: {
          _id: "$items.name",
          totalSold: { $sum: "$items.quantity" },
          revenue: { $sum: "$items.subtotal" },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 5 },
    ]);

    // Product count
    const totalProducts = await Produce.countDocuments({ farmer: farmerId });
    const activeProducts = await Produce.countDocuments({ farmer: farmerId, isAvailable: true });

    // Review stats
    const reviewStats = await Review.aggregate([
      { $match: { farmer: farmerId } },
      {
        $group: {
          _id: null,
          avgRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        revenue: orderStats[0] || { totalRevenue: 0, totalOrders: 0, avgOrderValue: 0 },
        ordersByStatus,
        dailyRevenue,
        topProducts,
        products: { total: totalProducts, active: activeProducts },
        reviews: reviewStats[0] || { avgRating: 0, totalReviews: 0 },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Customer spending analytics
// @route   GET /api/analytics/customer
// @access  Customer
exports.getCustomerAnalytics = async (req, res, next) => {
  try {
    const customerId = req.user._id;

    const spendingStats = await Order.aggregate([
      { $match: { customer: customerId, status: "delivered" } },
      {
        $group: {
          _id: null,
          totalSpent: { $sum: "$totalAmount" },
          totalOrders: { $sum: 1 },
          avgOrderValue: { $avg: "$totalAmount" },
        },
      },
    ]);

    // Monthly spending (last 6 months)
    const monthlySpending = await Order.aggregate([
      {
        $match: {
          customer: customerId,
          status: "delivered",
          createdAt: { $gte: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000) },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          spent: { $sum: "$totalAmount" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Most ordered items
    const favoriteItems = await Order.aggregate([
      { $match: { customer: customerId, status: "delivered" } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.name",
          timesOrdered: { $sum: 1 },
          totalQuantity: { $sum: "$items.quantity" },
        },
      },
      { $sort: { timesOrdered: -1 } },
      { $limit: 5 },
    ]);

    res.status(200).json({
      success: true,
      data: {
        spending: spendingStats[0] || { totalSpent: 0, totalOrders: 0, avgOrderValue: 0 },
        monthlySpending,
        favoriteItems,
      },
    });
  } catch (error) {
    next(error);
  }
};

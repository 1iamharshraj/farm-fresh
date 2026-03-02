const Order = require("../models/Order");
const Produce = require("../models/Produce");
const mongoose = require("mongoose");

// @desc    Get demand forecast for a farmer's products
// @route   GET /api/smart/demand-forecast
// @access  Farmer
exports.getDemandForecast = async (req, res, next) => {
  try {
    const farmerId = req.user._id;

    // Get historical sales data (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const salesData = await Order.aggregate([
      {
        $match: {
          "items.farmer": farmerId,
          status: "delivered",
          createdAt: { $gte: thirtyDaysAgo },
        },
      },
      { $unwind: "$items" },
      { $match: { "items.farmer": farmerId } },
      {
        $group: {
          _id: {
            product: "$items.name",
            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          },
          quantity: { $sum: "$items.quantity" },
          revenue: { $sum: "$items.subtotal" },
        },
      },
      { $sort: { "_id.date": 1 } },
    ]);

    // Group by product
    const productMap = {};
    salesData.forEach((entry) => {
      const name = entry._id.product;
      if (!productMap[name]) {
        productMap[name] = { history: [], totalSold: 0, totalRevenue: 0 };
      }
      productMap[name].history.push({
        date: entry._id.date,
        quantity: entry.quantity,
      });
      productMap[name].totalSold += entry.quantity;
      productMap[name].totalRevenue += entry.revenue;
    });

    // Simple forecasting: moving average + trend
    const forecasts = Object.entries(productMap).map(([name, data]) => {
      const quantities = data.history.map((h) => h.quantity);
      const avgDaily = quantities.length > 0
        ? quantities.reduce((a, b) => a + b, 0) / quantities.length
        : 0;

      // Trend: compare last 7 days vs first 7 days
      const recentAvg = quantities.slice(-7).reduce((a, b) => a + b, 0) / Math.min(7, quantities.length);
      const olderAvg = quantities.slice(0, 7).reduce((a, b) => a + b, 0) / Math.min(7, quantities.length);
      const trend = olderAvg > 0 ? ((recentAvg - olderAvg) / olderAvg) * 100 : 0;

      // Forecast next 7 days
      const forecastDaily = Math.max(0, avgDaily * (1 + trend / 100));
      const forecast7Days = Math.round(forecastDaily * 7);

      return {
        product: name,
        totalSold: data.totalSold,
        totalRevenue: data.totalRevenue,
        avgDailyDemand: Math.round(avgDaily * 10) / 10,
        trend: Math.round(trend),
        trendLabel: trend > 10 ? "rising" : trend < -10 ? "declining" : "stable",
        forecast7Days,
        recommendation:
          trend > 10
            ? "Increase stock - demand is rising"
            : trend < -10
            ? "Reduce stock - demand is declining"
            : "Maintain current stock levels",
      };
    });

    // Sort by total revenue descending
    forecasts.sort((a, b) => b.totalRevenue - a.totalRevenue);

    res.status(200).json({
      success: true,
      data: {
        forecasts,
        summary: {
          totalProducts: forecasts.length,
          risingProducts: forecasts.filter((f) => f.trendLabel === "rising").length,
          decliningProducts: forecasts.filter((f) => f.trendLabel === "declining").length,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get price suggestions based on market data
// @route   GET /api/smart/price-suggestions
// @access  Farmer
exports.getPriceSuggestions = async (req, res, next) => {
  try {
    const farmerId = req.user._id;

    // Get farmer's products
    const myProduce = await Produce.find({ farmer: farmerId }).select(
      "name price category unit quantityAvailable"
    );

    // Get market averages for similar products
    const suggestions = await Promise.all(
      myProduce.map(async (product) => {
        const marketData = await Produce.aggregate([
          {
            $match: {
              category: product.category,
              isAvailable: true,
              farmer: { $ne: farmerId },
            },
          },
          {
            $group: {
              _id: null,
              avgPrice: { $avg: "$price" },
              minPrice: { $min: "$price" },
              maxPrice: { $max: "$price" },
              totalListings: { $sum: 1 },
            },
          },
        ]);

        const market = marketData[0] || {
          avgPrice: product.price,
          minPrice: product.price,
          maxPrice: product.price,
          totalListings: 0,
        };

        const priceDiff = product.price - market.avgPrice;
        const priceDiffPercent = market.avgPrice > 0
          ? Math.round((priceDiff / market.avgPrice) * 100)
          : 0;

        return {
          product: product.name,
          currentPrice: product.price,
          unit: product.unit,
          stock: product.quantityAvailable,
          market: {
            avgPrice: Math.round(market.avgPrice),
            minPrice: market.minPrice,
            maxPrice: market.maxPrice,
            listings: market.totalListings,
          },
          suggestion:
            priceDiffPercent > 20
              ? "Consider lowering price - above market average"
              : priceDiffPercent < -20
              ? "You can increase price - below market average"
              : "Price is competitive",
          priceDiffPercent,
        };
      })
    );

    res.status(200).json({ success: true, data: suggestions });
  } catch (error) {
    next(error);
  }
};

// @desc    Get personalized recommendations for customers
// @route   GET /api/smart/recommendations
// @access  Customer
exports.getRecommendations = async (req, res, next) => {
  try {
    const customerId = req.user._id;

    // Get customer's past ordered items
    const pastOrders = await Order.find({
      customer: customerId,
      status: "delivered",
    })
      .select("items")
      .limit(10);

    const orderedCategories = new Set();
    const orderedFarmers = new Set();
    pastOrders.forEach((order) => {
      order.items.forEach((item) => {
        if (item.farmer) orderedFarmers.add(item.farmer.toString());
      });
    });

    // Find produce from previously ordered farmers or popular items
    let recommended;
    if (orderedFarmers.size > 0) {
      recommended = await Produce.find({
        farmer: { $in: [...orderedFarmers] },
        isAvailable: true,
        quantityAvailable: { $gt: 0 },
      })
        .populate("farmer", "name farmDetails.farmName averageRating")
        .populate("category", "name")
        .sort({ averageRating: -1 })
        .limit(8);
    }

    // If not enough, fill with popular items
    if (!recommended || recommended.length < 4) {
      const popular = await Produce.find({
        isAvailable: true,
        quantityAvailable: { $gt: 0 },
      })
        .populate("farmer", "name farmDetails.farmName averageRating")
        .populate("category", "name")
        .sort({ averageRating: -1, createdAt: -1 })
        .limit(8);

      recommended = recommended ? [...recommended, ...popular] : popular;
      // Deduplicate
      const seen = new Set();
      recommended = recommended.filter((item) => {
        if (seen.has(item._id.toString())) return false;
        seen.add(item._id.toString());
        return true;
      });
    }

    res.status(200).json({
      success: true,
      data: recommended.slice(0, 8),
    });
  } catch (error) {
    next(error);
  }
};

const Delivery = require("../models/Delivery");
const Order = require("../models/Order");
const User = require("../models/User");

// @desc    Toggle delivery agent availability
// @route   PUT /api/delivery/toggle-availability
// @access  Delivery Agent
exports.toggleAvailability = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    user.deliveryDetails.isAvailable = !user.deliveryDetails.isAvailable;
    await user.save();

    res.status(200).json({
      success: true,
      message: `You are now ${user.deliveryDetails.isAvailable ? "online" : "offline"}`,
      data: { isAvailable: user.deliveryDetails.isAvailable },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update delivery agent's current location
// @route   PUT /api/delivery/location
// @access  Delivery Agent
exports.updateLocation = async (req, res, next) => {
  try {
    const { latitude, longitude } = req.body;

    await User.findByIdAndUpdate(req.user._id, {
      "deliveryDetails.currentLocation": {
        type: "Point",
        coordinates: [longitude, latitude],
      },
    });

    res.status(200).json({ success: true, message: "Location updated" });
  } catch (error) {
    next(error);
  }
};

// @desc    Get available orders for pickup (ready_for_pickup with no agent)
// @route   GET /api/delivery/available-orders
// @access  Delivery Agent
exports.getAvailableOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({
      status: "ready_for_pickup",
      deliveryAgent: { $exists: false },
    })
      .populate("customer", "name phone address")
      .populate("items.farmer", "name phone farmDetails.farmName farmDetails.farmAddress")
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
};

// @desc    Accept a delivery assignment
// @route   PUT /api/delivery/accept/:orderId
// @access  Delivery Agent
exports.acceptDelivery = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate("customer", "name phone address")
      .populate("items.farmer", "name phone farmDetails.farmName farmDetails.farmAddress");

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (order.status !== "ready_for_pickup") {
      return res.status(400).json({
        success: false,
        message: "Order is not ready for pickup",
      });
    }

    if (order.deliveryAgent) {
      return res.status(400).json({
        success: false,
        message: "Order already has a delivery agent assigned",
      });
    }

    // Assign agent to order
    order.deliveryAgent = req.user._id;
    order.status = "picked_up";
    order.statusHistory.push({
      status: "picked_up",
      note: `Picked up by delivery agent`,
    });
    await order.save();

    // Create delivery record
    const farmer = order.items[0]?.farmer;
    const delivery = await Delivery.create({
      order: order._id,
      deliveryAgent: req.user._id,
      status: "accepted",
      pickupLocation: {
        address: farmer?.farmDetails?.farmAddress?.city || "Farmer location",
      },
      dropoffLocation: {
        address: `${order.deliveryAddress?.street || ""}, ${order.deliveryAddress?.city || ""}`.trim(),
      },
      distance: (Math.random() * 10 + 2).toFixed(1), // Simulated distance
      estimatedTime: Math.floor(Math.random() * 30 + 15), // 15-45 min
      earnings: Math.round(order.deliveryFee * 0.8), // 80% of delivery fee
      acceptedAt: new Date(),
    });

    await order.populate("deliveryAgent", "name phone");

    res.status(200).json({
      success: true,
      message: "Delivery accepted",
      data: { order, delivery },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get my active deliveries
// @route   GET /api/delivery/my-deliveries
// @access  Delivery Agent
exports.getMyDeliveries = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = { deliveryAgent: req.user._id };

    if (status === "active") {
      query.status = { $in: ["accepted", "picked_up", "in_transit"] };
    } else if (status === "completed") {
      query.status = "delivered";
    } else if (status) {
      query.status = status;
    }

    const deliveries = await Delivery.find(query)
      .populate({
        path: "order",
        populate: [
          { path: "customer", select: "name phone address" },
          { path: "items.farmer", select: "name phone farmDetails.farmName" },
        ],
      })
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: deliveries });
  } catch (error) {
    next(error);
  }
};

// @desc    Update delivery status
// @route   PUT /api/delivery/:id/status
// @access  Delivery Agent
exports.updateDeliveryStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const delivery = await Delivery.findById(req.params.id);

    if (!delivery) {
      return res.status(404).json({ success: false, message: "Delivery not found" });
    }

    if (delivery.deliveryAgent.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    const validTransitions = {
      accepted: ["picked_up"],
      picked_up: ["in_transit"],
      in_transit: ["delivered"],
    };

    if (!validTransitions[delivery.status]?.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot change status from '${delivery.status}' to '${status}'`,
      });
    }

    delivery.status = status;
    if (status === "picked_up") delivery.pickedUpAt = new Date();
    if (status === "delivered") {
      delivery.deliveredAt = new Date();
      if (delivery.acceptedAt) {
        delivery.actualTime = Math.round((new Date() - delivery.acceptedAt) / 60000);
      }
    }
    await delivery.save();

    // Also update the order status
    const order = await Order.findById(delivery.order);
    if (order) {
      const orderStatusMap = {
        picked_up: "picked_up",
        in_transit: "in_transit",
        delivered: "delivered",
      };
      const newOrderStatus = orderStatusMap[status];
      if (newOrderStatus) {
        order.status = newOrderStatus;
        order.statusHistory.push({
          status: newOrderStatus,
          note: `Delivery ${status.replace(/_/g, " ")}`,
        });
        if (status === "delivered") {
          order.deliveredAt = new Date();
          if (order.paymentMethod === "cod") {
            order.paymentStatus = "paid";
          }
        }
        await order.save();
      }
    }

    await delivery.populate({
      path: "order",
      populate: [
        { path: "customer", select: "name phone address" },
        { path: "items.farmer", select: "name phone farmDetails.farmName" },
      ],
    });

    res.status(200).json({
      success: true,
      message: `Delivery status updated to ${status.replace(/_/g, " ")}`,
      data: delivery,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get delivery agent earnings
// @route   GET /api/delivery/earnings
// @access  Delivery Agent
exports.getEarnings = async (req, res, next) => {
  try {
    const { period = "today" } = req.query;

    let startDate;
    const now = new Date();
    if (period === "today") {
      startDate = new Date(now.setHours(0, 0, 0, 0));
    } else if (period === "week") {
      startDate = new Date(now.setDate(now.getDate() - 7));
    } else if (period === "month") {
      startDate = new Date(now.setMonth(now.getMonth() - 1));
    } else {
      startDate = new Date(0);
    }

    const deliveries = await Delivery.find({
      deliveryAgent: req.user._id,
      status: "delivered",
      deliveredAt: { $gte: startDate },
    });

    const totalEarnings = deliveries.reduce((sum, d) => sum + (d.earnings || 0), 0);
    const totalDeliveries = deliveries.length;
    const avgTime = deliveries.length
      ? Math.round(deliveries.reduce((sum, d) => sum + (d.actualTime || 0), 0) / deliveries.length)
      : 0;

    // Get all-time stats
    const allTimeStats = await Delivery.aggregate([
      { $match: { deliveryAgent: req.user._id, status: "delivered" } },
      {
        $group: {
          _id: null,
          totalEarnings: { $sum: "$earnings" },
          totalDeliveries: { $sum: 1 },
          avgDistance: { $avg: "$distance" },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        period: {
          earnings: totalEarnings,
          deliveries: totalDeliveries,
          avgTime,
        },
        allTime: allTimeStats[0] || { totalEarnings: 0, totalDeliveries: 0, avgDistance: 0 },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get delivery dashboard stats
// @route   GET /api/delivery/stats
// @access  Delivery Agent
exports.getDashboardStats = async (req, res, next) => {
  try {
    const agentId = req.user._id;

    const [activeCount, todayDeliveries, allTimeStats] = await Promise.all([
      Delivery.countDocuments({
        deliveryAgent: agentId,
        status: { $in: ["accepted", "picked_up", "in_transit"] },
      }),
      Delivery.find({
        deliveryAgent: agentId,
        status: "delivered",
        deliveredAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      }),
      Delivery.aggregate([
        { $match: { deliveryAgent: agentId, status: "delivered" } },
        {
          $group: {
            _id: null,
            totalEarnings: { $sum: "$earnings" },
            totalDeliveries: { $sum: 1 },
          },
        },
      ]),
    ]);

    const todayEarnings = todayDeliveries.reduce((sum, d) => sum + (d.earnings || 0), 0);
    const stats = allTimeStats[0] || { totalEarnings: 0, totalDeliveries: 0 };

    res.status(200).json({
      success: true,
      data: {
        activeDeliveries: activeCount,
        todayEarnings,
        todayDeliveries: todayDeliveries.length,
        totalEarnings: stats.totalEarnings,
        totalDeliveries: stats.totalDeliveries,
        isAvailable: req.user.deliveryDetails?.isAvailable || false,
      },
    });
  } catch (error) {
    next(error);
  }
};

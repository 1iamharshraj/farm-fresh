const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Produce = require("../models/Produce");
const User = require("../models/User");
const { createNotification } = require("./notification.controller");
const { emitOrderUpdate, emitToRole, emitToUser } = require("../config/socket");

// @desc    Place order from cart
// @route   POST /api/orders
// @access  Customer
exports.placeOrder = async (req, res, next) => {
  try {
    const { paymentMethod = "cod", paymentStatus: reqPaymentStatus, customerNote, deliveryAddress } = req.body;

    const cart = await Cart.findOne({ customer: req.user._id }).populate({
      path: "items.produce",
      select: "name price unit images farmer quantityAvailable isAvailable",
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: "Cart is empty" });
    }

    // Build order items with snapshots
    const orderItems = [];
    for (const cartItem of cart.items) {
      const produce = cartItem.produce;
      if (!produce || !produce.isAvailable) {
        return res.status(400).json({
          success: false,
          message: `${produce?.name || "Item"} is no longer available`,
        });
      }
      if (cartItem.quantity > produce.quantityAvailable) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${produce.name}`,
        });
      }

      orderItems.push({
        produce: produce._id,
        farmer: produce.farmer,
        name: produce.name,
        image: produce.images?.[0]?.url || "",
        price: produce.price,
        unit: produce.unit,
        quantity: cartItem.quantity,
        subtotal: produce.price * cartItem.quantity,
      });
    }

    const itemsTotal = orderItems.reduce((sum, item) => sum + item.subtotal, 0);
    const deliveryFee = 30; // Fixed delivery fee for now
    const totalAmount = itemsTotal + deliveryFee;

    // Use provided address or user's saved address
    const address = deliveryAddress || {
      street: req.user.address?.street,
      city: req.user.address?.city,
      state: req.user.address?.state,
      pincode: req.user.address?.pincode,
    };

    const order = await Order.create({
      customer: req.user._id,
      items: orderItems,
      deliveryAddress: address,
      itemsTotal,
      deliveryFee,
      totalAmount,
      paymentMethod,
      paymentStatus: reqPaymentStatus === "completed" ? "paid" : "pending",
      customerNote,
    });

    // Reduce produce quantities
    for (const item of orderItems) {
      await Produce.findByIdAndUpdate(item.produce, {
        $inc: { quantityAvailable: -item.quantity },
      });
    }

    // Clear cart
    cart.items = [];
    await cart.save();

    await order.populate([
      { path: "customer", select: "name email phone" },
      { path: "items.farmer", select: "name farmDetails.farmName" },
    ]);

    // Notify farmers about new order
    const farmerIds = [...new Set(orderItems.map((item) => item.farmer.toString()))];
    for (const farmerId of farmerIds) {
      createNotification({
        recipient: farmerId,
        type: "order_placed",
        title: "New Order Received",
        message: `New order ${order.orderNumber} with Rs.${totalAmount}`,
        data: { orderId: order._id },
      });
    }

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Authenticated (owner, farmer, or delivery agent)
exports.getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("customer", "name email phone address")
      .populate("items.farmer", "name phone farmDetails.farmName")
      .populate("deliveryAgent", "name phone");

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Access check
    const userId = req.user._id.toString();
    const isCustomer = order.customer._id.toString() === userId;
    const isFarmer = order.items.some((item) => item.farmer?._id?.toString() === userId);
    const isAgent = order.deliveryAgent?._id?.toString() === userId;

    if (!isCustomer && !isFarmer && !isAgent) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

// @desc    Get customer's orders
// @route   GET /api/orders/my
// @access  Customer
exports.getMyOrders = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = { customer: req.user._id };
    if (status) query.status = status;

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate("items.farmer", "name farmDetails.farmName")
        .populate("deliveryAgent", "name phone")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit)),
      Order.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: orders,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get farmer's orders
// @route   GET /api/orders/farmer
// @access  Farmer
exports.getFarmerOrders = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = { "items.farmer": req.user._id };
    if (status) query.status = status;

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate("customer", "name phone address")
        .populate("deliveryAgent", "name phone")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit)),
      Order.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: orders,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status (farmer confirms, prepares, etc.)
// @route   PUT /api/orders/:id/status
// @access  Farmer or Delivery Agent
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Validate status transitions
    const validTransitions = {
      placed: ["confirmed", "cancelled"],
      confirmed: ["preparing", "cancelled"],
      preparing: ["ready_for_pickup", "cancelled"],
      ready_for_pickup: ["picked_up"],
      picked_up: ["in_transit"],
      in_transit: ["delivered"],
    };

    if (!validTransitions[order.status]?.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot change status from '${order.status}' to '${status}'`,
      });
    }

    order.status = status;
    order.statusHistory.push({ status, note: note || `Status updated to ${status}` });

    if (status === "delivered") {
      order.deliveredAt = new Date();
      if (order.paymentMethod === "cod") {
        order.paymentStatus = "paid";
      }
    }

    await order.save();
    await order.populate([
      { path: "customer", select: "name email phone" },
      { path: "items.farmer", select: "name farmDetails.farmName" },
      { path: "deliveryAgent", select: "name phone" },
    ]);

    // Notify customer about status change
    const statusLabels = {
      confirmed: "Order Confirmed",
      preparing: "Order Being Prepared",
      ready_for_pickup: "Order Ready for Pickup",
      picked_up: "Order Picked Up",
      in_transit: "Order In Transit",
      delivered: "Order Delivered",
    };

    createNotification({
      recipient: order.customer._id || order.customer,
      type: `order_${status}`,
      title: statusLabels[status] || `Order ${status}`,
      message: `Your order ${order.orderNumber} is now ${status.replace(/_/g, " ")}`,
      data: { orderId: order._id },
    });

    // When order is ready for pickup, notify available delivery agents
    if (status === "ready_for_pickup") {
      const availableAgents = await User.find({
        role: "delivery_agent",
        "deliveryDetails.isAvailable": true,
      }).select("_id");

      for (const agent of availableAgents) {
        createNotification({
          recipient: agent._id,
          type: "order_ready_for_pickup",
          title: "New Order Available",
          message: `Order ${order.orderNumber} is ready for pickup (Rs.${order.totalAmount})`,
          data: { orderId: order._id },
        });
        emitToUser(agent._id.toString(), "delivery:newAssignment", {
          orderId: order._id,
          orderNumber: order.orderNumber,
          totalAmount: order.totalAmount,
        });
      }
    }

    // Emit real-time order update
    emitOrderUpdate(order._id.toString(), "order:statusUpdate", {
      orderId: order._id,
      status,
      orderNumber: order.orderNumber,
    });

    res.status(200).json({
      success: true,
      message: `Order status updated to ${status}`,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Customer
exports.cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (order.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    const cancellableStatuses = ["placed", "confirmed"];
    if (!cancellableStatuses.includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: "Order cannot be cancelled at this stage",
      });
    }

    order.status = "cancelled";
    order.cancellationReason = req.body.reason || "Cancelled by customer";
    order.statusHistory.push({ status: "cancelled", note: order.cancellationReason });

    // Restore produce quantities
    for (const item of order.items) {
      await Produce.findByIdAndUpdate(item.produce, {
        $inc: { quantityAvailable: item.quantity },
      });
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: "Order cancelled",
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

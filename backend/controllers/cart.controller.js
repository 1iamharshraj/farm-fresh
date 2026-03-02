const Cart = require("../models/Cart");
const Produce = require("../models/Produce");

// @desc    Get customer's cart
// @route   GET /api/cart
// @access  Customer only
exports.getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ customer: req.user._id }).populate({
      path: "items.produce",
      select: "name price unit images farmer isAvailable quantityAvailable",
      populate: { path: "farmer", select: "name farmDetails.farmName" },
    });

    if (!cart) {
      cart = { items: [], totalAmount: 0 };
    }

    res.status(200).json({ success: true, data: cart });
  } catch (error) {
    next(error);
  }
};

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Customer only
exports.addToCart = async (req, res, next) => {
  try {
    const { produceId, quantity = 1 } = req.body;

    const produce = await Produce.findById(produceId);
    if (!produce) {
      return res.status(404).json({ success: false, message: "Produce not found" });
    }
    if (!produce.isAvailable) {
      return res.status(400).json({ success: false, message: "Produce is not available" });
    }
    if (quantity > produce.quantityAvailable) {
      return res.status(400).json({ success: false, message: "Insufficient quantity available" });
    }

    let cart = await Cart.findOne({ customer: req.user._id });

    if (!cart) {
      cart = new Cart({ customer: req.user._id, items: [] });
    }

    // Check if item already in cart
    const existingIndex = cart.items.findIndex(
      (item) => item.produce.toString() === produceId
    );

    if (existingIndex > -1) {
      cart.items[existingIndex].quantity += quantity;
      cart.items[existingIndex].priceAtAdd = produce.price;
    } else {
      cart.items.push({
        produce: produceId,
        quantity,
        priceAtAdd: produce.price,
      });
    }

    await cart.save();

    // Populate and return
    await cart.populate({
      path: "items.produce",
      select: "name price unit images farmer isAvailable quantityAvailable",
      populate: { path: "farmer", select: "name farmDetails.farmName" },
    });

    res.status(200).json({ success: true, message: "Item added to cart", data: cart });
  } catch (error) {
    next(error);
  }
};

// @desc    Update item quantity in cart
// @route   PUT /api/cart/:itemId
// @access  Customer only
exports.updateCartItem = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    const cart = await Cart.findOne({ customer: req.user._id });

    if (!cart) {
      return res.status(404).json({ success: false, message: "Cart not found" });
    }

    const item = cart.items.id(req.params.itemId);
    if (!item) {
      return res.status(404).json({ success: false, message: "Item not found in cart" });
    }

    if (quantity <= 0) {
      item.deleteOne();
    } else {
      item.quantity = quantity;
    }

    await cart.save();
    await cart.populate({
      path: "items.produce",
      select: "name price unit images farmer isAvailable quantityAvailable",
      populate: { path: "farmer", select: "name farmDetails.farmName" },
    });

    res.status(200).json({ success: true, data: cart });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:itemId
// @access  Customer only
exports.removeFromCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ customer: req.user._id });
    if (!cart) {
      return res.status(404).json({ success: false, message: "Cart not found" });
    }

    cart.items = cart.items.filter(
      (item) => item._id.toString() !== req.params.itemId
    );

    await cart.save();
    await cart.populate({
      path: "items.produce",
      select: "name price unit images farmer isAvailable quantityAvailable",
      populate: { path: "farmer", select: "name farmDetails.farmName" },
    });

    res.status(200).json({ success: true, message: "Item removed", data: cart });
  } catch (error) {
    next(error);
  }
};

// @desc    Clear entire cart
// @route   DELETE /api/cart
// @access  Customer only
exports.clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ customer: req.user._id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    res.status(200).json({ success: true, message: "Cart cleared", data: { items: [], totalAmount: 0 } });
  } catch (error) {
    next(error);
  }
};

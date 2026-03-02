const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { authorize } = require("../middleware/role");
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} = require("../controllers/cart.controller");

router.use(protect, authorize("customer"));

router.route("/").get(getCart).post(addToCart).delete(clearCart);
router.route("/:itemId").put(updateCartItem).delete(removeFromCart);

module.exports = router;

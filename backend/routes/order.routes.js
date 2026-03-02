const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { authorize } = require("../middleware/role");
const {
  placeOrder,
  getOrderById,
  getMyOrders,
  getFarmerOrders,
  updateOrderStatus,
  cancelOrder,
} = require("../controllers/order.controller");

router.post("/", protect, authorize("customer"), placeOrder);
router.get("/my", protect, authorize("customer"), getMyOrders);
router.get("/farmer", protect, authorize("farmer"), getFarmerOrders);
router.get("/:id", protect, getOrderById);
router.put("/:id/status", protect, authorize("farmer", "delivery_agent"), updateOrderStatus);
router.put("/:id/cancel", protect, authorize("customer"), cancelOrder);

module.exports = router;

const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { authorize } = require("../middleware/role");
const {
  toggleAvailability,
  updateLocation,
  getAvailableOrders,
  acceptDelivery,
  getMyDeliveries,
  updateDeliveryStatus,
  getEarnings,
  getDashboardStats,
} = require("../controllers/delivery.controller");

router.use(protect, authorize("delivery_agent"));

router.put("/toggle-availability", toggleAvailability);
router.put("/location", updateLocation);
router.get("/available-orders", getAvailableOrders);
router.put("/accept/:orderId", acceptDelivery);
router.get("/my-deliveries", getMyDeliveries);
router.put("/:id/status", updateDeliveryStatus);
router.get("/earnings", getEarnings);
router.get("/stats", getDashboardStats);

module.exports = router;

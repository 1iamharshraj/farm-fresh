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
  getDeliveryCoordinates,
} = require("../controllers/delivery.controller");

// Coordinates endpoint accessible by any authenticated user (customers need it for tracking)
router.get("/:id/coordinates", protect, getDeliveryCoordinates);

// All other routes require delivery_agent role
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

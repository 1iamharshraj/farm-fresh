const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { authorize } = require("../middleware/role");
const {
  getFarmerAnalytics,
  getCustomerAnalytics,
} = require("../controllers/analytics.controller");

router.get("/farmer", protect, authorize("farmer"), getFarmerAnalytics);
router.get("/customer", protect, authorize("customer"), getCustomerAnalytics);

module.exports = router;

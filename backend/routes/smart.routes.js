const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { authorize } = require("../middleware/role");
const {
  getDemandForecast,
  getPriceSuggestions,
  getRecommendations,
} = require("../controllers/smart.controller");

router.get("/demand-forecast", protect, authorize("farmer"), getDemandForecast);
router.get("/price-suggestions", protect, authorize("farmer"), getPriceSuggestions);
router.get("/recommendations", protect, authorize("customer"), getRecommendations);

module.exports = router;

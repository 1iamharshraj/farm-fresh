const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { authorize } = require("../middleware/role");
const {
  submitReview,
  getFarmerReviews,
  getProduceReviews,
} = require("../controllers/review.controller");

router.post("/", protect, authorize("customer"), submitReview);
router.get("/farmer/:id", getFarmerReviews);
router.get("/produce/:id", getProduceReviews);

module.exports = router;

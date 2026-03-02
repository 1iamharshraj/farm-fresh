const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { authorize } = require("../middleware/role");
const {
  createProduce,
  getAllProduce,
  getProduceById,
  updateProduce,
  deleteProduce,
  getMyProduce,
  toggleAvailability,
  getNearbyProduce,
  getCategories,
  seedCategories,
} = require("../controllers/produce.controller");

// Category routes
router.get("/categories", getCategories);
router.post("/categories/seed", seedCategories);

// Farmer-specific routes (must be before /:id)
router.get("/farmer/me", protect, authorize("farmer"), getMyProduce);
router.get("/nearby", getNearbyProduce);

// CRUD routes
router.route("/").get(getAllProduce).post(protect, authorize("farmer"), createProduce);

router
  .route("/:id")
  .get(getProduceById)
  .put(protect, authorize("farmer"), updateProduce)
  .delete(protect, authorize("farmer"), deleteProduce);

router.put("/:id/toggle", protect, authorize("farmer"), toggleAvailability);

module.exports = router;

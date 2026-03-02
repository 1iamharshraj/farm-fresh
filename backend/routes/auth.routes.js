const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  register,
  login,
  getMe,
  logout,
  forgotPassword,
  resetPassword,
  updateProfile,
  updatePassword,
} = require("../controllers/auth.controller");

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);
router.post("/logout", protect, logout);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:resetToken", resetPassword);
router.put("/update-profile", protect, updateProfile);
router.put("/update-password", protect, updatePassword);

module.exports = router;

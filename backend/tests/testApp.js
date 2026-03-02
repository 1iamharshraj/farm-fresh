/**
 * Test Express app - mirrors server.js but without DB connection,
 * Socket.io, rate limiting, or listening on a port.
 */
const express = require("express");
const cookieParser = require("cookie-parser");
const errorHandler = require("../middleware/errorHandler");

const app = express();

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health check
app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "Farm Fresh API is running" });
});

// API Routes
app.use("/api/auth", require("../routes/auth.routes"));
app.use("/api/produce", require("../routes/produce.routes"));
app.use("/api/cart", require("../routes/cart.routes"));
app.use("/api/orders", require("../routes/order.routes"));
app.use("/api/delivery", require("../routes/delivery.routes"));
app.use("/api/notifications", require("../routes/notification.routes"));
app.use("/api/reviews", require("../routes/review.routes"));
app.use("/api/analytics", require("../routes/analytics.routes"));
app.use("/api/smart", require("../routes/smart.routes"));

// Global error handler
app.use(errorHandler);

module.exports = app;

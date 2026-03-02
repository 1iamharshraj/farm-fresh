const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");
require("dotenv").config();

const app = express();

// Connect to MongoDB
connectDB();

// Core middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Farm Fresh API is running",
    timestamp: new Date().toISOString(),
  });
});

// API Routes (will be added in subsequent phases)
// app.use("/api/auth", require("./routes/auth.routes"));
// app.use("/api/produce", require("./routes/produce.routes"));
// app.use("/api/cart", require("./routes/cart.routes"));
// app.use("/api/orders", require("./routes/order.routes"));
// app.use("/api/payments", require("./routes/payment.routes"));
// app.use("/api/delivery", require("./routes/delivery.routes"));
// app.use("/api/reviews", require("./routes/review.routes"));
// app.use("/api/notifications", require("./routes/notification.routes"));

// Global error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🌱 Farm Fresh API running on port ${PORT}`);
});

module.exports = app;

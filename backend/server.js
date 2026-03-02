const express = require("express");
const http = require("http");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
// express-mongo-sanitize is incompatible with Express v5 (req.query is read-only)
// Using a custom sanitizer middleware instead
const compression = require("compression");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");
const { initializeSocket } = require("./config/socket");
require("dotenv").config();

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
initializeSocket(server);

// Connect to MongoDB
connectDB();

// CORS must be FIRST so preflight OPTIONS requests always get CORS headers
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

// Security middleware
app.use(helmet());
app.use(compression()); // GZIP compression

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per windowMs
  message: { success: false, message: "Too many requests, please try again later" },
});
app.use("/api/", limiter);

// Stricter rate limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: "Too many auth attempts, please try again later" },
});
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Custom NoSQL injection sanitizer (Express v5 compatible — req.query is read-only)
app.use((req, res, next) => {
  const sanitize = (obj) => {
    if (typeof obj !== "object" || obj === null) return obj;
    for (const key in obj) {
      if (key.startsWith("$")) {
        delete obj[key];
      } else if (typeof obj[key] === "object") {
        sanitize(obj[key]);
      }
    }
    return obj;
  };
  if (req.body) sanitize(req.body);
  if (req.params) sanitize(req.params);
  next();
});

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Farm Fresh API is running",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/produce", require("./routes/produce.routes"));
app.use("/api/cart", require("./routes/cart.routes"));
app.use("/api/orders", require("./routes/order.routes"));
app.use("/api/delivery", require("./routes/delivery.routes"));
app.use("/api/notifications", require("./routes/notification.routes"));
app.use("/api/reviews", require("./routes/review.routes"));
app.use("/api/analytics", require("./routes/analytics.routes"));
app.use("/api/smart", require("./routes/smart.routes"));

// Global error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🌱 Farm Fresh API running on port ${PORT} [${process.env.NODE_ENV || "development"}]`);
});

module.exports = app;

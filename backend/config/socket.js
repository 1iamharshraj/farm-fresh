const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

let io;

const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // Auth middleware for socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error("Authentication required"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("name role");
      if (!user) {
        return next(new Error("User not found"));
      }

      socket.user = user;
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.user._id.toString();

    // Join user's personal room
    socket.join(`user:${userId}`);

    // Join role-based room
    socket.join(`role:${socket.user.role}`);

    // Delivery agent location updates
    socket.on("delivery:updateLocation", async (data) => {
      const { orderId, latitude, longitude } = data;
      if (orderId) {
        // Broadcast to customer tracking this order
        io.to(`order:${orderId}`).emit("delivery:locationUpdate", {
          orderId,
          latitude,
          longitude,
          agentId: userId,
        });
      }
    });

    // Join order room for tracking
    socket.on("order:track", (orderId) => {
      socket.join(`order:${orderId}`);
    });

    // Leave order room
    socket.on("order:untrack", (orderId) => {
      socket.leave(`order:${orderId}`);
    });

    socket.on("disconnect", () => {
      // Cleanup handled automatically
    });
  });

  return io;
};

const getIO = () => {
  return io || null;
};

// Helper to emit events to specific users
const emitToUser = (userId, event, data) => {
  if (io) {
    io.to(`user:${userId}`).emit(event, data);
  }
};

// Helper to emit to a role group
const emitToRole = (role, event, data) => {
  if (io) {
    io.to(`role:${role}`).emit(event, data);
  }
};

// Helper to emit order updates
const emitOrderUpdate = (orderId, event, data) => {
  if (io) {
    io.to(`order:${orderId}`).emit(event, data);
  }
};

module.exports = { initializeSocket, getIO, emitToUser, emitToRole, emitOrderUpdate };

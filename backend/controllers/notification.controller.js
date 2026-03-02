const Notification = require("../models/Notification");
const { emitToUser } = require("../config/socket");

// @desc    Get my notifications
// @route   GET /api/notifications
// @access  Authenticated
exports.getNotifications = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find({ recipient: req.user._id })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit)),
      Notification.countDocuments({ recipient: req.user._id }),
      Notification.countDocuments({ recipient: req.user._id, isRead: false }),
    ]);

    res.status(200).json({
      success: true,
      data: notifications,
      unreadCount,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Authenticated
exports.markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    res.status(200).json({ success: true, data: notification });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Authenticated
exports.markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { isRead: true }
    );

    res.status(200).json({ success: true, message: "All notifications marked as read" });
  } catch (error) {
    next(error);
  }
};

// @desc    Get unread count
// @route   GET /api/notifications/unread-count
// @access  Authenticated
exports.getUnreadCount = async (req, res, next) => {
  try {
    const count = await Notification.countDocuments({
      recipient: req.user._id,
      isRead: false,
    });

    res.status(200).json({ success: true, data: { count } });
  } catch (error) {
    next(error);
  }
};

// Helper: Create and send notification (used by other controllers)
exports.createNotification = async ({ recipient, type, title, message, data }) => {
  try {
    const notification = await Notification.create({
      recipient,
      type,
      title,
      message,
      data,
    });

    // Push real-time via Socket.io
    emitToUser(recipient.toString(), "notification:new", notification);

    return notification;
  } catch (error) {
    console.error("Failed to create notification:", error.message);
  }
};

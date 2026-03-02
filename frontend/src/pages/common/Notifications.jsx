import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/common/Navbar";
import API from "../../api/axios";
import { useSocket } from "../../hooks/useSocket";
import toast from "react-hot-toast";
import {
  FaBell,
  FaCheckDouble,
  FaBox,
  FaTruck,
  FaCheckCircle,
  FaClock,
  FaTimes,
  FaStar,
} from "react-icons/fa";

const typeIcons = {
  order_placed: <FaBox className="text-blue-500" />,
  order_confirmed: <FaCheckCircle className="text-indigo-500" />,
  order_preparing: <FaClock className="text-amber-500" />,
  order_ready: <FaBox className="text-purple-500" />,
  order_picked_up: <FaTruck className="text-cyan-500" />,
  order_in_transit: <FaTruck className="text-orange-500" />,
  order_delivered: <FaCheckCircle className="text-green-500" />,
  order_cancelled: <FaTimes className="text-red-500" />,
  delivery_assigned: <FaTruck className="text-blue-500" />,
  new_review: <FaStar className="text-yellow-500" />,
  system: <FaBell className="text-gray-500" />,
};

const typeBgs = {
  order_placed: "bg-blue-50",
  order_confirmed: "bg-indigo-50",
  order_preparing: "bg-amber-50",
  order_ready: "bg-purple-50",
  order_picked_up: "bg-cyan-50",
  order_in_transit: "bg-orange-50",
  order_delivered: "bg-green-50",
  order_cancelled: "bg-red-50",
  delivery_assigned: "bg-blue-50",
  new_review: "bg-yellow-50",
  system: "bg-gray-50",
};

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { setUnreadCount } = useSocket();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const { data } = await API.get("/notifications");
        setNotifications(data.data);
        setUnreadCount(data.unreadCount);
      } catch {
        toast.error("Failed to load notifications");
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, [setUnreadCount]);

  const handleMarkAllRead = async () => {
    try {
      await API.put("/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success("All marked as read");
    } catch {
      toast.error("Failed to update");
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await API.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // Silently fail
    }
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return "Just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="min-h-screen bg-[#fafaf5]">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-['Poppins'] text-2xl font-bold text-gray-900">
            Notifications
          </h1>
          {notifications.some((n) => !n.isRead) && (
            <button
              onClick={handleMarkAllRead}
              className="flex items-center gap-1.5 text-sm font-medium text-green-600 hover:text-green-700"
            >
              <FaCheckDouble className="text-xs" />
              Mark all as read
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm">
            <FaBell className="text-gray-300 text-4xl mx-auto mb-4" />
            <p className="text-gray-500">No notifications yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                onClick={() => !notification.isRead && handleMarkRead(notification._id)}
                className={`bg-white rounded-xl p-4 shadow-sm border transition-all cursor-pointer ${
                  notification.isRead
                    ? "border-gray-100"
                    : "border-green-200 bg-green-50/30"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      typeBgs[notification.type] || "bg-gray-50"
                    }`}
                  >
                    {typeIcons[notification.type] || <FaBell className="text-gray-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className={`text-sm font-semibold ${notification.isRead ? "text-gray-700" : "text-gray-900"}`}>
                        {notification.title}
                      </p>
                      <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                        {getTimeAgo(notification.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {notification.message}
                    </p>
                    {notification.data?.orderId && (
                      <Link
                        to={`/orders/${notification.data.orderId}`}
                        className="text-xs text-green-600 hover:text-green-700 font-medium mt-1 inline-block"
                        onClick={(e) => e.stopPropagation()}
                      >
                        View Order
                      </Link>
                    )}
                  </div>
                  {!notification.isRead && (
                    <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0 mt-2"></div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;

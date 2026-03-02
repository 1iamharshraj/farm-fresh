import { useState, useEffect, useCallback } from "react";
import Navbar from "../../components/common/Navbar";
import API from "../../api/axios";
import { useSocket } from "../../hooks/useSocket";
import toast from "react-hot-toast";
import {
  FaBox,
  FaRupeeSign,
  FaMapMarkerAlt,
  FaUser,
  FaPhone,
  FaClock,
  FaCheckCircle,
} from "react-icons/fa";

const AvailableOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(null);

  let socket = null;
  try {
    const socketCtx = useSocket();
    socket = socketCtx.socket;
  } catch {
    // SocketProvider not available
  }

  const fetchOrders = useCallback(async () => {
    try {
      const { data } = await API.get("/delivery/available-orders");
      setOrders(data.data);
    } catch {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Auto-refresh when new delivery assignment is available
  useEffect(() => {
    if (!socket) return;
    const handleNewAssignment = () => {
      fetchOrders();
      toast("New order available for pickup!", { icon: "📦" });
    };
    socket.on("delivery:newAssignment", handleNewAssignment);
    return () => socket.off("delivery:newAssignment", handleNewAssignment);
  }, [socket, fetchOrders]);

  const handleAccept = async (orderId) => {
    setAccepting(orderId);
    try {
      await API.put(`/delivery/accept/${orderId}`);
      toast.success("Delivery accepted!");
      setOrders((prev) => prev.filter((o) => o._id !== orderId));
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to accept");
    } finally {
      setAccepting(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafaf5]">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-['Poppins'] text-2xl font-bold text-gray-900">
            Available Orders
          </h1>
          <button
            onClick={fetchOrders}
            className="px-4 py-2 text-sm font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100"
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm">
            <FaBox className="text-gray-300 text-4xl mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No orders available for pickup</p>
            <p className="text-sm text-gray-400 mt-1">
              Check back soon or refresh the page
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-xl p-5 shadow-sm border border-gray-100"
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="font-semibold text-gray-800 text-sm">
                      {order.orderNumber}
                    </span>
                    <span className="ml-2 px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                      Ready for Pickup
                    </span>
                  </div>
                  <span className="flex items-center font-bold text-green-700 text-lg">
                    <FaRupeeSign className="text-sm" />
                    {order.totalAmount}
                  </span>
                </div>

                {/* Customer Info */}
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                  <span className="flex items-center gap-1">
                    <FaUser className="text-xs" />
                    {order.customer?.name}
                  </span>
                  {order.customer?.phone && (
                    <span className="flex items-center gap-1">
                      <FaPhone className="text-xs" />
                      {order.customer.phone}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <FaClock className="text-xs" />
                    {new Date(order.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                </div>

                {/* Delivery Address */}
                <div className="flex items-start gap-2 text-sm text-gray-600 mb-3 bg-gray-50 rounded-lg p-3">
                  <FaMapMarkerAlt className="text-green-500 mt-0.5 flex-shrink-0" />
                  <span>
                    {order.deliveryAddress?.street && `${order.deliveryAddress.street}, `}
                    {order.deliveryAddress?.city}, {order.deliveryAddress?.state} -{" "}
                    {order.deliveryAddress?.pincode}
                  </span>
                </div>

                {/* Items summary */}
                <div className="text-sm text-gray-500 mb-4">
                  {order.items.length} item{order.items.length > 1 ? "s" : ""} -{" "}
                  {order.items.map((item) => item.name).join(", ")}
                </div>

                {/* Accept Button */}
                <button
                  onClick={() => handleAccept(order._id)}
                  disabled={accepting === order._id}
                  className="w-full bg-green-600 text-white py-2.5 rounded-xl font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {accepting === order._id ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Accepting...
                    </>
                  ) : (
                    <>
                      <FaCheckCircle />
                      Accept Delivery
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AvailableOrders;

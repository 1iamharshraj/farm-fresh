import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/common/Navbar";
import API from "../../api/axios";
import toast from "react-hot-toast";
import { FaBox, FaRupeeSign, FaClock, FaCheckCircle, FaTruck, FaTimes, FaUser } from "react-icons/fa";

const statusColors = {
  placed: "bg-blue-100 text-blue-700",
  confirmed: "bg-indigo-100 text-indigo-700",
  preparing: "bg-amber-100 text-amber-700",
  ready_for_pickup: "bg-purple-100 text-purple-700",
  picked_up: "bg-cyan-100 text-cyan-700",
  in_transit: "bg-orange-100 text-orange-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

const FarmerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const params = statusFilter ? `?status=${statusFilter}` : "";
        const { data } = await API.get(`/orders/farmer${params}`);
        setOrders(data.data);
      } catch {
        toast.error("Failed to load orders");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [statusFilter]);

  const handleUpdateStatus = async (orderId, status) => {
    try {
      await API.put(`/orders/${orderId}/status`, { status });
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status } : o))
      );
      toast.success(`Order ${status.replace(/_/g, " ")}`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update");
    }
  };

  return (
    <div className="min-h-screen bg-[#fafaf5]">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="font-['Poppins'] text-2xl font-bold text-gray-900 mb-6">
          Customer Orders
        </h1>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {["", "placed", "confirmed", "preparing", "ready_for_pickup", "delivered"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${
                statusFilter === status ? "bg-green-600 text-white" : "bg-white text-gray-600 border hover:bg-gray-50"
              }`}
            >
              {status === "" ? "All" : status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm">
            <FaBox className="text-gray-300 text-4xl mx-auto mb-4" />
            <p className="text-gray-500">No orders yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <Link to={`/orders/${order._id}`} className="font-semibold text-gray-800 text-sm hover:text-green-600">
                    {order.orderNumber}
                  </Link>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[order.status]}`}>
                    {order.status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                  <FaUser className="text-xs" />
                  <span>{order.customer?.name}</span>
                  <span className="text-gray-300">|</span>
                  <span>{order.items.length} items</span>
                  <span className="text-gray-300">|</span>
                  <span className="flex items-center font-semibold text-green-700">
                    <FaRupeeSign className="text-[10px]" />{order.totalAmount}
                  </span>
                  <span className="text-xs text-gray-400 ml-auto">
                    {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </span>
                </div>

                {/* Quick Actions */}
                <div className="flex gap-2">
                  {order.status === "placed" && (
                    <>
                      <button onClick={() => handleUpdateStatus(order._id, "confirmed")} className="px-4 py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700">
                        Confirm
                      </button>
                      <button onClick={() => handleUpdateStatus(order._id, "cancelled")} className="px-4 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100">
                        Reject
                      </button>
                    </>
                  )}
                  {order.status === "confirmed" && (
                    <button onClick={() => handleUpdateStatus(order._id, "preparing")} className="px-4 py-1.5 bg-amber-600 text-white rounded-lg text-xs font-medium hover:bg-amber-700">
                      Start Preparing
                    </button>
                  )}
                  {order.status === "preparing" && (
                    <button onClick={() => handleUpdateStatus(order._id, "ready_for_pickup")} className="px-4 py-1.5 bg-purple-600 text-white rounded-lg text-xs font-medium hover:bg-purple-700">
                      Ready for Pickup
                    </button>
                  )}
                  <Link to={`/orders/${order._id}`} className="px-4 py-1.5 border border-gray-200 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-50 ml-auto">
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FarmerOrders;

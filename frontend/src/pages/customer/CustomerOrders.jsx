import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/common/Navbar";
import API from "../../api/axios";
import toast from "react-hot-toast";
import { FaBox, FaRupeeSign, FaClock, FaCheckCircle, FaTruck, FaTimes } from "react-icons/fa";

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

const statusIcons = {
  placed: <FaClock className="text-xs" />,
  confirmed: <FaCheckCircle className="text-xs" />,
  preparing: <FaBox className="text-xs" />,
  ready_for_pickup: <FaBox className="text-xs" />,
  picked_up: <FaTruck className="text-xs" />,
  in_transit: <FaTruck className="text-xs" />,
  delivered: <FaCheckCircle className="text-xs" />,
  cancelled: <FaTimes className="text-xs" />,
};

const CustomerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const params = statusFilter ? `?status=${statusFilter}` : "";
        const { data } = await API.get(`/orders/my${params}`);
        setOrders(data.data);
      } catch {
        toast.error("Failed to load orders");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [statusFilter]);

  return (
    <div className="min-h-screen bg-[#fafaf5]">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="font-['Poppins'] text-2xl font-bold text-gray-900 mb-6">
          My Orders
        </h1>

        {/* Status Filter */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {["", "placed", "confirmed", "in_transit", "delivered", "cancelled"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                statusFilter === status
                  ? "bg-green-600 text-white"
                  : "bg-white text-gray-600 border hover:bg-gray-50"
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
            <p className="text-gray-500">No orders found.</p>
            <Link to="/browse" className="text-green-600 hover:text-green-700 font-medium text-sm mt-2 inline-block">
              Browse Produce
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Link
                key={order._id}
                to={`/orders/${order._id}`}
                className="block bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="font-semibold text-gray-800 text-sm">{order.orderNumber}</span>
                    <span className="text-xs text-gray-400 ml-2">
                      {new Date(order.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric", month: "short", year: "numeric",
                      })}
                    </span>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[order.status]}`}>
                    {statusIcons[order.status]}
                    {order.status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>{order.items.length} item{order.items.length > 1 ? "s" : ""}</span>
                  <span className="flex items-center font-semibold text-green-700">
                    <FaRupeeSign className="text-xs" />{order.totalAmount}
                  </span>
                  <span className="text-xs text-gray-400 ml-auto capitalize">{order.paymentMethod}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerOrders;

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/common/Navbar";
import API from "../../api/axios";
import toast from "react-hot-toast";
import {
  FaTruck,
  FaRupeeSign,
  FaMapMarkerAlt,
  FaUser,
  FaPhone,
  FaBox,
  FaArrowRight,
  FaCheckCircle,
} from "react-icons/fa";

const statusColors = {
  accepted: "bg-blue-100 text-blue-700",
  picked_up: "bg-cyan-100 text-cyan-700",
  in_transit: "bg-orange-100 text-orange-700",
  delivered: "bg-green-100 text-green-700",
};

const ActiveDeliveries = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("active");
  const [updating, setUpdating] = useState(null);

  const fetchDeliveries = async () => {
    setLoading(true);
    try {
      const { data } = await API.get(`/delivery/my-deliveries?status=${filter}`);
      setDeliveries(data.data);
    } catch {
      toast.error("Failed to load deliveries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveries();
  }, [filter]);

  const handleUpdateStatus = async (deliveryId, status) => {
    setUpdating(deliveryId);
    try {
      const { data } = await API.put(`/delivery/${deliveryId}/status`, { status });
      setDeliveries((prev) =>
        prev.map((d) => (d._id === deliveryId ? data.data : d))
      );
      toast.success(data.message);
      if (status === "delivered" && filter === "active") {
        setDeliveries((prev) => prev.filter((d) => d._id !== deliveryId));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update");
    } finally {
      setUpdating(null);
    }
  };

  const getNextAction = (status) => {
    switch (status) {
      case "accepted":
        return { label: "Mark Picked Up", nextStatus: "picked_up", color: "bg-cyan-600 hover:bg-cyan-700" };
      case "picked_up":
        return { label: "Start Transit", nextStatus: "in_transit", color: "bg-orange-600 hover:bg-orange-700" };
      case "in_transit":
        return { label: "Mark Delivered", nextStatus: "delivered", color: "bg-green-600 hover:bg-green-700" };
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#fafaf5]">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="font-['Poppins'] text-2xl font-bold text-gray-900 mb-6">
          My Deliveries
        </h1>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { key: "active", label: "Active" },
            { key: "completed", label: "Completed" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                filter === tab.key
                  ? "bg-green-600 text-white"
                  : "bg-white text-gray-600 border hover:bg-gray-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
          </div>
        ) : deliveries.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm">
            <FaTruck className="text-gray-300 text-4xl mx-auto mb-4" />
            <p className="text-gray-500 font-medium">
              {filter === "active" ? "No active deliveries" : "No completed deliveries yet"}
            </p>
            {filter === "active" && (
              <Link
                to="/delivery/available"
                className="text-green-600 hover:text-green-700 font-medium text-sm mt-2 inline-block"
              >
                Browse Available Orders
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {deliveries.map((delivery) => {
              const order = delivery.order;
              const action = getNextAction(delivery.status);

              return (
                <div
                  key={delivery._id}
                  className="bg-white rounded-xl p-5 shadow-sm border border-gray-100"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold text-gray-800 text-sm">
                      {order?.orderNumber || "Order"}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[delivery.status]}`}
                    >
                      {delivery.status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                    </span>
                  </div>

                  {/* Customer Info */}
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                    <span className="flex items-center gap-1">
                      <FaUser className="text-xs" />
                      {order?.customer?.name}
                    </span>
                    {order?.customer?.phone && (
                      <a
                        href={`tel:${order.customer.phone}`}
                        className="flex items-center gap-1 text-green-600 hover:text-green-700"
                      >
                        <FaPhone className="text-xs" />
                        {order.customer.phone}
                      </a>
                    )}
                  </div>

                  {/* Route Info */}
                  <div className="bg-gray-50 rounded-lg p-3 mb-3 space-y-2">
                    <div className="flex items-start gap-2 text-sm">
                      <div className="w-5 h-5 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <FaBox className="text-amber-600 text-[8px]" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Pickup</p>
                        <p className="text-gray-700">{delivery.pickupLocation?.address || "Farmer location"}</p>
                      </div>
                    </div>
                    <div className="ml-2.5 border-l-2 border-dashed border-gray-300 h-3"></div>
                    <div className="flex items-start gap-2 text-sm">
                      <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <FaMapMarkerAlt className="text-green-600 text-[8px]" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Delivery</p>
                        <p className="text-gray-700">{delivery.dropoffLocation?.address || "Customer address"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                    {delivery.distance && (
                      <span>{delivery.distance} km</span>
                    )}
                    {delivery.estimatedTime && (
                      <span>~{delivery.estimatedTime} min</span>
                    )}
                    <span className="flex items-center font-semibold text-green-700 ml-auto">
                      <FaRupeeSign className="text-[10px]" />
                      {delivery.earnings}
                    </span>
                  </div>

                  {/* Action Button */}
                  {action && (
                    <button
                      onClick={() => handleUpdateStatus(delivery._id, action.nextStatus)}
                      disabled={updating === delivery._id}
                      className={`w-full ${action.color} text-white py-2.5 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50`}
                    >
                      {updating === delivery._id ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      ) : (
                        <>
                          {action.nextStatus === "delivered" ? (
                            <FaCheckCircle />
                          ) : (
                            <FaArrowRight />
                          )}
                          {action.label}
                        </>
                      )}
                    </button>
                  )}

                  {delivery.status === "delivered" && (
                    <div className="text-center text-sm text-green-600 font-medium bg-green-50 rounded-xl py-2.5">
                      <FaCheckCircle className="inline mr-1" />
                      Delivered{delivery.actualTime ? ` in ${delivery.actualTime} min` : ""}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActiveDeliveries;

import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "../../components/common/Navbar";
import MapView from "../../components/common/MapView";
import API from "../../api/axios";
import { useAuth } from "../../hooks/useAuth";
import toast from "react-hot-toast";
import {
  FaArrowLeft,
  FaRupeeSign,
  FaMapMarkerAlt,
  FaClock,
  FaCheckCircle,
  FaBox,
  FaTruck,
  FaTimes,
  FaPhone,
  FaStar,
} from "react-icons/fa";
import ReviewForm from "../../components/common/ReviewForm";

const statusSteps = [
  { key: "placed", label: "Placed", icon: <FaClock /> },
  { key: "confirmed", label: "Confirmed", icon: <FaCheckCircle /> },
  { key: "preparing", label: "Preparing", icon: <FaBox /> },
  { key: "ready_for_pickup", label: "Ready", icon: <FaBox /> },
  { key: "picked_up", label: "Picked Up", icon: <FaTruck /> },
  { key: "in_transit", label: "In Transit", icon: <FaTruck /> },
  { key: "delivered", label: "Delivered", icon: <FaCheckCircle /> },
];

const OrderDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviewed, setReviewed] = useState(false);
  const [trackingCoords, setTrackingCoords] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await API.get(`/orders/${id}`);
        setOrder(data.data);
      } catch {
        toast.error("Failed to load order");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  // Fetch tracking coordinates for delivery map
  useEffect(() => {
    if (!order || !["picked_up", "in_transit", "delivered"].includes(order.status)) return;
    const fetchTracking = async () => {
      try {
        // Uses order ID — backend finds delivery by order ID
        const { data } = await API.get(`/delivery/${id}/coordinates`);
        if (data.data) setTrackingCoords(data.data);
      } catch {
        // Ignore - map just won't show
      }
    };
    fetchTracking();
  }, [order?.status, id]);

  const handleCancel = async () => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    try {
      const { data } = await API.put(`/orders/${id}/cancel`, { reason: "Cancelled by customer" });
      setOrder(data.data);
      toast.success("Order cancelled");
    } catch (error) {
      toast.error(error.response?.data?.message || "Cannot cancel order");
    }
  };

  const handleUpdateStatus = async (status) => {
    try {
      const { data } = await API.put(`/orders/${id}/status`, { status });
      setOrder(data.data);
      toast.success(`Order ${status.replace(/_/g, " ")}`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafaf5]">
        <Navbar />
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!order) return null;

  const currentStepIndex = statusSteps.findIndex((s) => s.key === order.status);
  const isCancelled = order.status === "cancelled";
  const canCancel = user?.role === "customer" && ["placed", "confirmed"].includes(order.status);
  const isFarmer = user?.role === "farmer";

  return (
    <div className="min-h-screen bg-[#fafaf5]">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to={isFarmer ? "/farmer/orders" : "/orders"} className="inline-flex items-center gap-2 text-gray-500 hover:text-green-600 text-sm mb-6">
          <FaArrowLeft /> Back to Orders
        </Link>

        {/* Order Header */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="font-['Poppins'] text-xl font-bold text-gray-900">
                Order {order.orderNumber}
              </h1>
              <p className="text-sm text-gray-500">
                Placed on {new Date(order.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
                })}
              </p>
            </div>
            {canCancel && (
              <button onClick={handleCancel} className="text-sm text-red-500 hover:text-red-600 font-medium flex items-center gap-1">
                <FaTimes /> Cancel Order
              </button>
            )}
          </div>

          {/* Status Timeline */}
          {!isCancelled ? (
            <div className="flex items-center justify-between relative mt-6">
              <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200"></div>
              <div className="absolute top-4 left-0 h-0.5 bg-green-500 transition-all" style={{ width: `${(currentStepIndex / (statusSteps.length - 1)) * 100}%` }}></div>
              {statusSteps.map((step, i) => (
                <div key={step.key} className="relative flex flex-col items-center z-10">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                    i <= currentStepIndex ? "bg-green-500 text-white" : "bg-gray-200 text-gray-400"
                  }`}>
                    {step.icon}
                  </div>
                  <span className={`text-[10px] mt-1 font-medium ${i <= currentStepIndex ? "text-green-700" : "text-gray-400"}`}>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-red-50 text-red-600 text-center py-3 rounded-xl font-medium mt-4">
              Order Cancelled - {order.cancellationReason}
            </div>
          )}
        </div>

        {/* Farmer Actions */}
        {isFarmer && !isCancelled && (
          <div className="bg-amber-50 rounded-xl p-4 mb-6 border border-amber-200">
            <p className="text-sm font-medium text-amber-800 mb-3">Update Order Status:</p>
            <div className="flex flex-wrap gap-2">
              {order.status === "placed" && (
                <button onClick={() => handleUpdateStatus("confirmed")} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700">
                  Confirm Order
                </button>
              )}
              {order.status === "confirmed" && (
                <button onClick={() => handleUpdateStatus("preparing")} className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700">
                  Start Preparing
                </button>
              )}
              {order.status === "preparing" && (
                <button onClick={() => handleUpdateStatus("ready_for_pickup")} className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700">
                  Ready for Pickup
                </button>
              )}
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-5 border-b">
                <h2 className="font-semibold text-gray-800">Order Items</h2>
              </div>
              <div className="divide-y">
                {order.items.map((item, i) => (
                  <div key={i} className="flex items-center gap-4 px-5 py-3">
                    <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      {item.image && !item.image.includes("placeholder") ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                      ) : (
                        <FaBox className="text-green-300" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800 text-sm">{item.name}</p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity} {item.unit}</p>
                    </div>
                    <span className="font-semibold text-gray-800 flex items-center text-sm">
                      <FaRupeeSign className="text-[10px]" />{item.subtotal}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-800 mb-3">Payment Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Items Total</span>
                  <span className="flex items-center"><FaRupeeSign className="text-[10px]" />{order.itemsTotal}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery Fee</span>
                  <span className="flex items-center"><FaRupeeSign className="text-[10px]" />{order.deliveryFee}</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between font-bold text-gray-800">
                    <span>Total</span>
                    <span className="flex items-center text-green-700"><FaRupeeSign className="text-xs" />{order.totalAmount}</span>
                  </div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>Payment</span>
                  <span className="capitalize">{order.paymentMethod} - {order.paymentStatus}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <FaMapMarkerAlt className="text-green-500 text-sm" /> Delivery Address
              </h3>
              <p className="text-sm text-gray-600">
                {order.deliveryAddress?.street && `${order.deliveryAddress.street}, `}
                {order.deliveryAddress?.city}, {order.deliveryAddress?.state} - {order.deliveryAddress?.pincode}
              </p>
            </div>
          </div>
        </div>

        {/* Review Section - show only for delivered orders by customers */}
        {order.status === "delivered" && user?.role === "customer" && !reviewed && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mt-6">
            <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FaStar className="text-yellow-400" /> Rate Your Experience
            </h2>
            <ReviewForm
              orderId={order._id}
              onReviewSubmitted={() => setReviewed(true)}
            />
          </div>
        )}
        {reviewed && (
          <div className="bg-green-50 rounded-xl p-4 mt-6 text-center text-green-700 font-medium text-sm">
            <FaCheckCircle className="inline mr-1" /> Thank you for your review!
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDetail;

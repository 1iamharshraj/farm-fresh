import { useState, useEffect } from "react";
import Navbar from "../../components/common/Navbar";
import API from "../../api/axios";
import toast from "react-hot-toast";
import {
  FaRupeeSign,
  FaShoppingCart,
  FaBox,
  FaStar,
  FaChartLine,
  FaTrophy,
} from "react-icons/fa";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const SalesAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("month");

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const { data } = await API.get(`/analytics/farmer?period=${period}`);
        setAnalytics(data.data);
      } catch {
        toast.error("Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [period]);

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

  const revenue = analytics?.revenue || {};
  const reviews = analytics?.reviews || {};

  return (
    <div className="min-h-screen bg-[#fafaf5]">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-['Poppins'] text-2xl font-bold text-gray-900">
            Sales Analytics
          </h1>
          <div className="flex gap-2">
            {[
              { key: "week", label: "Week" },
              { key: "month", label: "Month" },
              { key: "year", label: "Year" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setPeriod(tab.key)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium ${
                  period === tab.key
                    ? "bg-green-600 text-white"
                    : "bg-white text-gray-600 border hover:bg-gray-50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center mb-3">
              <FaRupeeSign className="text-green-500" />
            </div>
            <p className="text-2xl font-bold text-gray-800 flex items-center font-['Poppins']">
              <FaRupeeSign className="text-base" />
              {Math.round(revenue.totalRevenue || 0)}
            </p>
            <p className="text-sm text-gray-500">Total Revenue</p>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mb-3">
              <FaShoppingCart className="text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-gray-800 font-['Poppins']">
              {revenue.totalOrders || 0}
            </p>
            <p className="text-sm text-gray-500">Total Orders</p>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center mb-3">
              <FaBox className="text-amber-500" />
            </div>
            <p className="text-2xl font-bold text-gray-800 font-['Poppins']">
              {analytics?.products?.active || 0}/{analytics?.products?.total || 0}
            </p>
            <p className="text-sm text-gray-500">Active Products</p>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center mb-3">
              <FaStar className="text-yellow-500" />
            </div>
            <p className="text-2xl font-bold text-gray-800 font-['Poppins']">
              {reviews.avgRating || "0.0"}
            </p>
            <p className="text-sm text-gray-500">
              Avg Rating ({reviews.totalReviews || 0} reviews)
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Revenue Chart */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FaChartLine className="text-green-500" /> Daily Revenue (Last 7 Days)
            </h2>
            {analytics?.dailyRevenue?.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={analytics.dailyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="_id"
                    tickFormatter={(val) =>
                      new Date(val).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })
                    }
                    fontSize={12}
                  />
                  <YAxis fontSize={12} />
                  <Tooltip
                    formatter={(value) => [`Rs.${value}`, "Revenue"]}
                    labelFormatter={(val) =>
                      new Date(val).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                      })
                    }
                  />
                  <Bar dataKey="revenue" fill="#22c55e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[250px] text-gray-400 text-sm">
                No revenue data yet
              </div>
            )}
          </div>

          {/* Top Products */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FaTrophy className="text-amber-500" /> Top Products
            </h2>
            {analytics?.topProducts?.length > 0 ? (
              <div className="space-y-3">
                {analytics.topProducts.map((product, i) => (
                  <div key={product._id} className="flex items-center gap-3">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        i === 0
                          ? "bg-amber-100 text-amber-700"
                          : i === 1
                          ? "bg-gray-100 text-gray-600"
                          : "bg-orange-50 text-orange-600"
                      }`}
                    >
                      {i + 1}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">
                        {product._id}
                      </p>
                      <p className="text-xs text-gray-500">
                        {product.totalSold} sold
                      </p>
                    </div>
                    <span className="font-semibold text-sm text-green-700 flex items-center">
                      <FaRupeeSign className="text-[10px]" />
                      {product.revenue}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-[200px] text-gray-400 text-sm">
                No sales data yet
              </div>
            )}
          </div>

          {/* Orders by Status */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 lg:col-span-2">
            <h2 className="font-semibold text-gray-800 mb-4">Order Status Breakdown</h2>
            <div className="flex flex-wrap gap-3">
              {analytics?.ordersByStatus?.map((status) => {
                const colors = {
                  placed: "bg-blue-50 text-blue-700 border-blue-200",
                  confirmed: "bg-indigo-50 text-indigo-700 border-indigo-200",
                  preparing: "bg-amber-50 text-amber-700 border-amber-200",
                  ready_for_pickup: "bg-purple-50 text-purple-700 border-purple-200",
                  delivered: "bg-green-50 text-green-700 border-green-200",
                  cancelled: "bg-red-50 text-red-700 border-red-200",
                };
                return (
                  <div
                    key={status._id}
                    className={`px-4 py-3 rounded-xl border ${
                      colors[status._id] || "bg-gray-50 text-gray-700 border-gray-200"
                    }`}
                  >
                    <p className="text-2xl font-bold font-['Poppins']">{status.count}</p>
                    <p className="text-xs font-medium capitalize">
                      {status._id?.replace(/_/g, " ")}
                    </p>
                  </div>
                );
              })}
              {(!analytics?.ordersByStatus || analytics.ordersByStatus.length === 0) && (
                <p className="text-gray-400 text-sm">No orders yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesAnalytics;

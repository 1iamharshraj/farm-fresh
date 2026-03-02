import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/common/Navbar";
import API from "../../api/axios";
import toast from "react-hot-toast";
import {
  FaRupeeSign,
  FaShoppingCart,
  FaReceipt,
  FaHeart,
  FaStore,
  FaChartLine,
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

const CustomerAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const { data } = await API.get("/analytics/customer");
        setAnalytics(data.data);
      } catch {
        toast.error("Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

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

  const spending = analytics?.spending || { totalSpent: 0, totalOrders: 0, avgOrderValue: 0 };
  const monthlySpending = analytics?.monthlySpending || [];
  const favoriteItems = analytics?.favoriteItems || [];

  // Format monthly data for chart
  const chartData = monthlySpending.map((m) => ({
    month: new Date(m._id + "-01").toLocaleDateString("en-IN", { month: "short" }),
    spent: m.spent,
    orders: m.orders,
  }));

  return (
    <div className="min-h-screen bg-[#fafaf5]">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="font-['Poppins'] text-2xl font-bold text-gray-900 mb-6">
          My Analytics
        </h1>

        {/* Stat Cards */}
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <FaRupeeSign className="text-green-600" />
              </div>
              <p className="text-sm text-gray-500">Total Spent</p>
            </div>
            <p className="text-2xl font-bold text-gray-800 flex items-center">
              <FaRupeeSign className="text-base" />
              {spending.totalSpent.toLocaleString("en-IN")}
            </p>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FaShoppingCart className="text-blue-600" />
              </div>
              <p className="text-sm text-gray-500">Total Orders</p>
            </div>
            <p className="text-2xl font-bold text-gray-800">{spending.totalOrders}</p>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <FaReceipt className="text-amber-600" />
              </div>
              <p className="text-sm text-gray-500">Avg Order Value</p>
            </div>
            <p className="text-2xl font-bold text-gray-800 flex items-center">
              <FaRupeeSign className="text-base" />
              {Math.round(spending.avgOrderValue).toLocaleString("en-IN")}
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Monthly Spending Chart */}
          <div className="lg:col-span-2 bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FaChartLine className="text-green-500 text-sm" />
              Monthly Spending (Last 6 Months)
            </h2>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(value) => [`Rs.${value}`, "Spent"]}
                    contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb" }}
                  />
                  <Bar dataKey="spent" fill="#22c55e" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-16 text-gray-400">
                <FaChartLine className="text-3xl mx-auto mb-2" />
                <p className="text-sm">No spending data yet</p>
              </div>
            )}
          </div>

          {/* Favorite Items */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FaHeart className="text-red-400 text-sm" />
              Most Ordered
            </h2>
            {favoriteItems.length > 0 ? (
              <div className="space-y-3">
                {favoriteItems.map((item, i) => (
                  <div key={item._id} className="flex items-center gap-3">
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      i === 0 ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-500"
                    }`}>
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 text-sm truncate">{item._id}</p>
                      <p className="text-xs text-gray-400">
                        {item.timesOrdered}x ordered &middot; {item.totalQuantity} units
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <FaHeart className="text-2xl mx-auto mb-2" />
                <p className="text-sm">No orders yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-6 flex gap-3">
          <Link
            to="/orders"
            className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <FaReceipt className="text-green-500" /> View Order History
          </Link>
          <Link
            to="/browse"
            className="flex items-center gap-2 px-4 py-2.5 bg-green-600 rounded-xl text-sm font-medium text-white hover:bg-green-700 transition-colors"
          >
            <FaStore /> Browse Produce
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CustomerAnalytics;

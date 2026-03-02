import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/common/Navbar";
import { useAuth } from "../../hooks/useAuth";
import API from "../../api/axios";
import toast from "react-hot-toast";
import {
  FaTruck,
  FaMoneyBillWave,
  FaRoute,
  FaToggleOn,
  FaToggleOff,
  FaBox,
  FaArrowRight,
  FaClock,
} from "react-icons/fa";

const DeliveryDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAvailable, setIsAvailable] = useState(false);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await API.get("/delivery/stats");
        setStats(data.data);
        setIsAvailable(data.data.isAvailable);
      } catch {
        toast.error("Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const handleToggle = async () => {
    setToggling(true);
    try {
      const { data } = await API.put("/delivery/toggle-availability");
      setIsAvailable(data.data.isAvailable);
      toast.success(data.message);
    } catch {
      toast.error("Failed to update status");
    } finally {
      setToggling(false);
    }
  };

  const statCards = stats
    ? [
        {
          label: "Active Deliveries",
          value: stats.activeDeliveries,
          icon: <FaTruck className="text-blue-500" />,
          bg: "bg-blue-50",
        },
        {
          label: "Today's Earnings",
          value: `Rs.${stats.todayEarnings}`,
          icon: <FaMoneyBillWave className="text-green-500" />,
          bg: "bg-green-50",
        },
        {
          label: "Today's Deliveries",
          value: stats.todayDeliveries,
          icon: <FaBox className="text-amber-500" />,
          bg: "bg-amber-50",
        },
        {
          label: "Total Earnings",
          value: `Rs.${stats.totalEarnings}`,
          icon: <FaRoute className="text-purple-500" />,
          bg: "bg-purple-50",
        },
      ]
    : [];

  return (
    <div className="min-h-screen bg-[#fafaf5]">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with availability toggle */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-['Poppins'] text-2xl font-bold text-gray-900">
              Welcome, {user?.name}!
            </h1>
            <p className="text-gray-500 mt-1">Delivery Partner Dashboard</p>
          </div>
          <button
            onClick={handleToggle}
            disabled={toggling}
            className={`flex items-center gap-3 px-5 py-3 rounded-xl font-medium text-sm transition-all ${
              isAvailable
                ? "bg-green-50 text-green-700 border-2 border-green-200"
                : "bg-gray-50 text-gray-500 border-2 border-gray-200"
            }`}
          >
            {isAvailable ? (
              <FaToggleOn className="text-green-500 text-2xl" />
            ) : (
              <FaToggleOff className="text-gray-400 text-2xl" />
            )}
            <span>{isAvailable ? "Online" : "Offline"}</span>
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isAvailable ? "bg-green-500 animate-pulse" : "bg-gray-400"
              }`}
            ></span>
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {statCards.map((stat) => (
                <div
                  key={stat.label}
                  className="bg-white rounded-xl p-5 shadow-sm border border-gray-100"
                >
                  <div
                    className={`w-10 h-10 ${stat.bg} rounded-lg flex items-center justify-center mb-3`}
                  >
                    {stat.icon}
                  </div>
                  <p className="font-['Poppins'] text-2xl font-bold text-gray-800">
                    {stat.value}
                  </p>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              <Link
                to="/delivery/active"
                className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                    <FaTruck className="text-blue-500 text-lg" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Active Deliveries</p>
                    <p className="text-sm text-gray-500">View and manage your deliveries</p>
                  </div>
                </div>
                <FaArrowRight className="text-gray-300 group-hover:text-green-500 transition-colors" />
              </Link>

              <Link
                to="/delivery/available"
                className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
                    <FaBox className="text-amber-500 text-lg" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Available Orders</p>
                    <p className="text-sm text-gray-500">Pick up new delivery orders</p>
                  </div>
                </div>
                <FaArrowRight className="text-gray-300 group-hover:text-green-500 transition-colors" />
              </Link>

              <Link
                to="/delivery/earnings"
                className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                    <FaMoneyBillWave className="text-green-500 text-lg" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Earnings</p>
                    <p className="text-sm text-gray-500">View your earnings breakdown</p>
                  </div>
                </div>
                <FaArrowRight className="text-gray-300 group-hover:text-green-500 transition-colors" />
              </Link>

              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                    <FaClock className="text-purple-500 text-lg" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Total Deliveries</p>
                    <p className="text-sm text-gray-500">{stats?.totalDeliveries || 0} completed</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DeliveryDashboard;

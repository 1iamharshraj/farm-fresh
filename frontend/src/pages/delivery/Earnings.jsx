import { useState, useEffect } from "react";
import Navbar from "../../components/common/Navbar";
import API from "../../api/axios";
import toast from "react-hot-toast";
import {
  FaRupeeSign,
  FaTruck,
  FaClock,
  FaRoute,
  FaChartLine,
} from "react-icons/fa";

const Earnings = () => {
  const [earnings, setEarnings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("today");

  useEffect(() => {
    const fetchEarnings = async () => {
      setLoading(true);
      try {
        const { data } = await API.get(`/delivery/earnings?period=${period}`);
        setEarnings(data.data);
      } catch {
        toast.error("Failed to load earnings");
      } finally {
        setLoading(false);
      }
    };
    fetchEarnings();
  }, [period]);

  return (
    <div className="min-h-screen bg-[#fafaf5]">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="font-['Poppins'] text-2xl font-bold text-gray-900 mb-6">
          Earnings
        </h1>

        {/* Period Selector */}
        <div className="flex gap-2 mb-6">
          {[
            { key: "today", label: "Today" },
            { key: "week", label: "This Week" },
            { key: "month", label: "This Month" },
            { key: "all", label: "All Time" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setPeriod(tab.key)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
                period === tab.key
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
        ) : (
          <>
            {/* Earnings Hero Card */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-6 mb-6 text-white">
              <p className="text-green-200 text-sm font-medium mb-1">
                {period === "today"
                  ? "Today's Earnings"
                  : period === "week"
                  ? "This Week's Earnings"
                  : period === "month"
                  ? "This Month's Earnings"
                  : "All Time Earnings"}
              </p>
              <p className="text-4xl font-bold flex items-center font-['Poppins']">
                <FaRupeeSign className="text-2xl" />
                {earnings?.period?.earnings || 0}
              </p>
              <div className="flex items-center gap-4 mt-4 text-green-100 text-sm">
                <span className="flex items-center gap-1">
                  <FaTruck className="text-xs" />
                  {earnings?.period?.deliveries || 0} deliveries
                </span>
                {earnings?.period?.avgTime > 0 && (
                  <span className="flex items-center gap-1">
                    <FaClock className="text-xs" />
                    Avg {earnings.period.avgTime} min
                  </span>
                )}
              </div>
            </div>

            {/* All-time Stats */}
            <div className="grid sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center mb-3">
                  <FaChartLine className="text-green-500" />
                </div>
                <p className="text-2xl font-bold text-gray-800 flex items-center font-['Poppins']">
                  <FaRupeeSign className="text-base" />
                  {earnings?.allTime?.totalEarnings || 0}
                </p>
                <p className="text-sm text-gray-500">Total Earnings</p>
              </div>

              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mb-3">
                  <FaTruck className="text-blue-500" />
                </div>
                <p className="text-2xl font-bold text-gray-800 font-['Poppins']">
                  {earnings?.allTime?.totalDeliveries || 0}
                </p>
                <p className="text-sm text-gray-500">Total Deliveries</p>
              </div>

              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center mb-3">
                  <FaRoute className="text-purple-500" />
                </div>
                <p className="text-2xl font-bold text-gray-800 font-['Poppins']">
                  {earnings?.allTime?.avgDistance
                    ? `${Number(earnings.allTime.avgDistance).toFixed(1)} km`
                    : "0 km"}
                </p>
                <p className="text-sm text-gray-500">Avg Distance</p>
              </div>
            </div>

            {/* Empty state */}
            {(!earnings?.period?.deliveries || earnings.period.deliveries === 0) && (
              <div className="bg-white rounded-xl p-8 text-center shadow-sm border border-gray-100">
                <FaTruck className="text-gray-300 text-3xl mx-auto mb-3" />
                <p className="text-gray-500">
                  No deliveries completed in this period
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Earnings;

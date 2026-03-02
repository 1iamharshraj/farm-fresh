import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/common/Navbar";
import { useAuth } from "../../hooks/useAuth";
import API from "../../api/axios";
import { FaBox, FaStore, FaChartLine, FaStar, FaPlus, FaArrowRight } from "react-icons/fa";

const FarmerDashboard = () => {
  const { user } = useAuth();
  const [produceCount, setProduceCount] = useState(0);
  const [recentProduce, setRecentProduce] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await API.get("/produce/farmer/me");
        setProduceCount(data.data.length);
        setRecentProduce(data.data.slice(0, 4));
      } catch {
        // ignore
      }
    };
    fetchData();
  }, []);

  const stats = [
    { label: "Total Products", value: String(produceCount), icon: <FaStore className="text-green-500" />, bg: "bg-green-50" },
    { label: "Active Orders", value: "0", icon: <FaBox className="text-amber-500" />, bg: "bg-amber-50" },
    { label: "Total Revenue", value: "Rs.0", icon: <FaChartLine className="text-blue-500" />, bg: "bg-blue-50" },
    { label: "Avg Rating", value: user?.averageRating?.toFixed(1) || "0.0", icon: <FaStar className="text-yellow-500" />, bg: "bg-yellow-50" },
  ];

  return (
    <div className="min-h-screen bg-[#fafaf5]">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-['Poppins'] text-2xl font-bold text-gray-900">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-gray-500 mt-1">
              {user?.farmDetails?.farmName || "Your farm dashboard"}
            </p>
          </div>
          <Link
            to="/farmer/produce/add"
            className="inline-flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-green-700 transition-colors text-sm shadow-md"
          >
            <FaPlus /> Add Produce
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div className={`w-10 h-10 ${stat.bg} rounded-lg flex items-center justify-center mb-3`}>
                {stat.icon}
              </div>
              <p className="font-['Poppins'] text-2xl font-bold text-gray-800">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Recent Produce */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between p-5 border-b">
            <h2 className="font-['Poppins'] font-semibold text-gray-800">Recent Listings</h2>
            <Link to="/farmer/produce" className="text-sm text-green-600 hover:text-green-700 flex items-center gap-1 font-medium">
              View All <FaArrowRight className="text-xs" />
            </Link>
          </div>
          {recentProduce.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-400 mb-4">No produce listed yet.</p>
              <Link to="/farmer/produce/add" className="text-green-600 hover:text-green-700 font-medium text-sm">
                Add your first produce
              </Link>
            </div>
          ) : (
            <div className="divide-y">
              {recentProduce.map((item) => (
                <div key={item._id} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <FaStore className="text-green-500 text-sm" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{item.name}</p>
                      <p className="text-xs text-gray-500">{item.category?.name} - {item.quantityAvailable} {item.unit}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-green-700">Rs.{item.price}/{item.unit}</p>
                    <span className={`text-xs ${item.isAvailable ? "text-green-500" : "text-red-500"}`}>
                      {item.isAvailable ? "Available" : "Unavailable"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FarmerDashboard;

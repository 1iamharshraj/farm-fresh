import Navbar from "../../components/common/Navbar";
import { useAuth } from "../../hooks/useAuth";
import { FaTruck, FaMoneyBillWave, FaRoute, FaStar } from "react-icons/fa";

const DeliveryDashboard = () => {
  const { user } = useAuth();

  const stats = [
    { label: "Active Deliveries", value: "0", icon: <FaTruck className="text-blue-500" />, bg: "bg-blue-50" },
    { label: "Today's Earnings", value: "Rs.0", icon: <FaMoneyBillWave className="text-green-500" />, bg: "bg-green-50" },
    { label: "Total Deliveries", value: "0", icon: <FaRoute className="text-amber-500" />, bg: "bg-amber-50" },
    { label: "Avg Rating", value: "0.0", icon: <FaStar className="text-yellow-500" />, bg: "bg-yellow-50" },
  ];

  return (
    <div className="min-h-screen bg-[#fafaf5]">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="font-['Poppins'] text-2xl font-bold text-gray-900">
            Welcome, {user?.name}!
          </h1>
          <p className="text-gray-500 mt-1">Delivery Partner Dashboard</p>
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

        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center">
          <p className="text-gray-400">
            Delivery assignments and maps will be available in the next phases.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DeliveryDashboard;

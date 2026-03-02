import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/common/Navbar";
import API from "../../api/axios";
import toast from "react-hot-toast";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaToggleOn,
  FaToggleOff,
  FaRupeeSign,
  FaBox,
  FaLeaf,
} from "react-icons/fa";

const ManageProduce = () => {
  const [produce, setProduce] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProduce = async () => {
    try {
      const { data } = await API.get("/produce/farmer/me");
      setProduce(data.data);
    } catch (error) {
      toast.error("Failed to load produce");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduce();
  }, []);

  const handleToggle = async (id) => {
    try {
      const { data } = await API.put(`/produce/${id}/toggle`);
      setProduce((prev) =>
        prev.map((p) => (p._id === id ? { ...p, isAvailable: data.data.isAvailable } : p))
      );
      toast.success(data.message);
    } catch (error) {
      toast.error("Failed to toggle availability");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this produce?")) return;
    try {
      await API.delete(`/produce/${id}`);
      setProduce((prev) => prev.filter((p) => p._id !== id));
      toast.success("Produce deleted");
    } catch (error) {
      toast.error("Failed to delete produce");
    }
  };

  return (
    <div className="min-h-screen bg-[#fafaf5]">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-['Poppins'] text-2xl font-bold text-gray-900">
            My Produce
          </h1>
          <Link
            to="/farmer/produce/add"
            className="inline-flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-green-700 transition-colors text-sm shadow-md"
          >
            <FaPlus /> Add Produce
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
          </div>
        ) : produce.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaLeaf className="text-green-500 text-2xl" />
            </div>
            <h3 className="font-['Poppins'] text-lg font-semibold text-gray-800 mb-2">
              No produce listed yet
            </h3>
            <p className="text-gray-500 mb-6">
              Start listing your farm produce to reach local customers.
            </p>
            <Link
              to="/farmer/produce/add"
              className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-green-700 transition-colors"
            >
              <FaPlus /> Add Your First Produce
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {produce.map((item) => (
              <div
                key={item._id}
                className={`bg-white rounded-xl shadow-sm border overflow-hidden transition-all hover:shadow-md ${
                  !item.isAvailable ? "opacity-60" : "border-gray-100"
                }`}
              >
                {/* Image */}
                <div className="h-40 bg-gradient-to-br from-green-100 to-emerald-50 flex items-center justify-center relative">
                  {item.images?.[0]?.url &&
                  !item.images[0].url.includes("placeholder") ? (
                    <img
                      src={item.images[0].url}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FaLeaf className="text-green-300 text-4xl" />
                  )}
                  {!item.isAvailable && (
                    <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-0.5 rounded-full text-xs font-medium">
                      Unavailable
                    </div>
                  )}
                  {item.isOrganic && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-0.5 rounded-full text-xs font-medium">
                      Organic
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="font-semibold text-gray-800 truncate">{item.name}</h3>
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                      {item.category?.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600 mt-2">
                    <span className="flex items-center gap-1 font-semibold text-green-700">
                      <FaRupeeSign className="text-xs" />
                      {item.price}/{item.unit}
                    </span>
                    <span className="flex items-center gap-1">
                      <FaBox className="text-xs text-gray-400" />
                      {item.quantityAvailable} {item.unit}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-4 pt-3 border-t">
                    <button
                      onClick={() => handleToggle(item._id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        item.isAvailable
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      }`}
                    >
                      {item.isAvailable ? <FaToggleOn /> : <FaToggleOff />}
                      {item.isAvailable ? "Active" : "Inactive"}
                    </button>
                    <Link
                      to={`/farmer/produce/edit/${item._id}`}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium hover:bg-blue-100"
                    >
                      <FaEdit /> Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100 ml-auto"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageProduce;

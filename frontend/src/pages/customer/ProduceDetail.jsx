import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "../../components/common/Navbar";
import API from "../../api/axios";
import { useAuth } from "../../hooks/useAuth";
import { useCart } from "../../hooks/useCart";
import toast from "react-hot-toast";
import {
  FaLeaf,
  FaStar,
  FaRupeeSign,
  FaShoppingCart,
  FaMapMarkerAlt,
  FaPhone,
  FaMinus,
  FaPlus,
  FaArrowLeft,
  FaClock,
  FaSeedling,
} from "react-icons/fa";
import { GiFarmer } from "react-icons/gi";

const ProduceDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [produce, setProduce] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    const fetchProduce = async () => {
      try {
        const { data } = await API.get(`/produce/${id}`);
        setProduce(data.data);
      } catch {
        toast.error("Failed to load produce details");
      } finally {
        setLoading(false);
      }
    };
    fetchProduce();
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) {
      toast.error("Please login to add to cart");
      return;
    }
    setAddingToCart(true);
    try {
      await addToCart(produce._id, quantity);
      toast.success("Added to cart!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add to cart");
    } finally {
      setAddingToCart(false);
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

  if (!produce) {
    return (
      <div className="min-h-screen bg-[#fafaf5]">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <p className="text-gray-500">Produce not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafaf5]">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/browse" className="inline-flex items-center gap-2 text-gray-500 hover:text-green-600 text-sm mb-6">
          <FaArrowLeft /> Back to Browse
        </Link>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Image */}
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
            <div className="h-80 lg:h-[420px] bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
              {produce.images?.[0]?.url && !produce.images[0].url.includes("placeholder") ? (
                <img src={produce.images[0].url} alt={produce.name} className="w-full h-full object-cover" />
              ) : (
                <FaLeaf className="text-green-300 text-6xl" />
              )}
            </div>
          </div>

          {/* Details */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs bg-green-100 text-green-700 px-2.5 py-0.5 rounded-full font-medium">
                {produce.category?.name}
              </span>
              {produce.isOrganic && (
                <span className="text-xs bg-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1">
                  <FaSeedling className="text-[10px]" /> Organic
                </span>
              )}
              {produce.growingMethod !== "conventional" && (
                <span className="text-xs bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full font-medium">
                  {produce.growingMethod}
                </span>
              )}
            </div>

            <h1 className="font-['Poppins'] text-3xl font-bold text-gray-900 mb-2">
              {produce.name}
            </h1>

            {produce.averageRating > 0 && (
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <FaStar key={i} className={`text-sm ${i < Math.round(produce.averageRating) ? "text-yellow-400" : "text-gray-200"}`} />
                  ))}
                </div>
                <span className="text-sm text-gray-500">({produce.totalReviews} reviews)</span>
              </div>
            )}

            <div className="flex items-baseline gap-2 mb-4">
              <span className="flex items-center text-3xl font-bold text-green-700">
                <FaRupeeSign className="text-xl" />{produce.price}
              </span>
              <span className="text-gray-500">per {produce.unit}</span>
            </div>

            <p className="text-gray-600 leading-relaxed mb-6">{produce.description}</p>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-500">Available</p>
                <p className="font-semibold text-gray-800">{produce.quantityAvailable} {produce.unit}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-500">Min. Order</p>
                <p className="font-semibold text-gray-800">{produce.minimumOrder} {produce.unit}</p>
              </div>
              {produce.harvestDate && (
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500">Harvested</p>
                  <p className="font-semibold text-gray-800 flex items-center gap-1">
                    <FaClock className="text-xs text-gray-400" />
                    {new Date(produce.harvestDate).toLocaleDateString()}
                  </p>
                </div>
              )}
              {produce.shelfLife && (
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500">Shelf Life</p>
                  <p className="font-semibold text-gray-800">{produce.shelfLife} days</p>
                </div>
              )}
            </div>

            {/* Quantity + Add to Cart */}
            {user?.role === "customer" && produce.isAvailable && (
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                  <button onClick={() => setQuantity(Math.max(produce.minimumOrder, quantity - 1))} className="px-3 py-2.5 hover:bg-gray-50 text-gray-600">
                    <FaMinus className="text-xs" />
                  </button>
                  <span className="px-4 py-2.5 font-medium text-gray-800 min-w-[50px] text-center">
                    {quantity}
                  </span>
                  <button onClick={() => setQuantity(Math.min(produce.quantityAvailable, quantity + 1))} className="px-3 py-2.5 hover:bg-gray-50 text-gray-600">
                    <FaPlus className="text-xs" />
                  </button>
                </div>
                <button
                  onClick={handleAddToCart}
                  disabled={addingToCart}
                  className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  <FaShoppingCart />
                  {addingToCart ? "Adding..." : "Add to Cart"}
                </button>
              </div>
            )}

            {!produce.isAvailable && (
              <div className="bg-red-50 text-red-600 text-center py-3 rounded-xl font-medium mb-6">
                Currently Unavailable
              </div>
            )}

            {/* Farmer Info */}
            <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <GiFarmer className="text-amber-500" /> Farmer Details
              </h3>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                  <GiFarmer className="text-amber-600 text-lg" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">{produce.farmer?.name}</p>
                  <p className="text-sm text-gray-500">
                    {produce.farmer?.farmDetails?.farmName || "Local Farm"}
                  </p>
                </div>
                {produce.farmer?.averageRating > 0 && (
                  <div className="ml-auto flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg">
                    <FaStar className="text-yellow-400 text-xs" />
                    <span className="text-sm font-medium">{produce.farmer.averageRating.toFixed(1)}</span>
                  </div>
                )}
              </div>
              {produce.farmer?.address?.city && (
                <p className="text-sm text-gray-500 mt-2 flex items-center gap-1">
                  <FaMapMarkerAlt className="text-xs text-gray-400" />
                  {produce.farmer.address.city}, {produce.farmer.address.state}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProduceDetail;

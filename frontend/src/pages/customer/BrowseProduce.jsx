import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/common/Navbar";
import API from "../../api/axios";
import { useAuth } from "../../hooks/useAuth";
import { useCart } from "../../hooks/useCart";
import toast from "react-hot-toast";
import {
  FaSearch,
  FaFilter,
  FaLeaf,
  FaStar,
  FaShoppingCart,
  FaRupeeSign,
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { GiFarmer } from "react-icons/gi";

const BrowseProduce = () => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [produce, setProduce] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    sort: "newest",
    isOrganic: false,
    minPrice: "",
    maxPrice: "",
  });

  const fetchProduce = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("page", page);
      params.append("limit", 12);
      if (filters.search) params.append("search", filters.search);
      if (filters.category) params.append("category", filters.category);
      if (filters.isOrganic) params.append("isOrganic", "true");
      if (filters.minPrice) params.append("minPrice", filters.minPrice);
      if (filters.maxPrice) params.append("maxPrice", filters.maxPrice);

      const sortMap = {
        newest: "newest",
        price_low: "price_low",
        price_high: "price_high",
        rating: "rating",
      };
      params.append("sort", sortMap[filters.sort] || "newest");

      const { data } = await API.get(`/produce?${params.toString()}`);
      setProduce(data.data);
      setPagination(data.pagination);
    } catch {
      toast.error("Failed to load produce");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await API.get("/produce/categories");
      setCategories(data.data);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProduce();
  }, [filters.category, filters.sort, filters.isOrganic]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProduce();
  };

  const handleAddToCart = async (produceId) => {
    if (!user) {
      toast.error("Please login to add to cart");
      return;
    }
    try {
      await addToCart(produceId);
      toast.success("Added to cart!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add to cart");
    }
  };

  const clearFilters = () => {
    setFilters({ search: "", category: "", sort: "newest", isOrganic: false, minPrice: "", maxPrice: "" });
  };

  return (
    <div className="min-h-screen bg-[#fafaf5]">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header + Search */}
        <div className="mb-6">
          <h1 className="font-['Poppins'] text-2xl font-bold text-gray-900 mb-4">
            Browse Fresh Produce
          </h1>
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                placeholder="Search for vegetables, fruits, dairy..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
              />
            </div>
            <button type="submit" className="bg-green-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-green-700 text-sm">
              Search
            </button>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 text-sm md:hidden"
            >
              <FaFilter />
            </button>
          </form>
        </div>

        <div className="flex gap-6">
          {/* Filters Sidebar */}
          <div className={`${showFilters ? "block" : "hidden"} md:block w-full md:w-64 flex-shrink-0`}>
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 sticky top-20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800">Filters</h3>
                <button onClick={clearFilters} className="text-xs text-green-600 hover:text-green-700">
                  Clear all
                </button>
              </div>

              {/* Categories */}
              <div className="mb-5">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Category</h4>
                <div className="space-y-1.5">
                  <button
                    onClick={() => setFilters({ ...filters, category: "" })}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-sm ${!filters.category ? "bg-green-100 text-green-700 font-medium" : "text-gray-600 hover:bg-gray-50"}`}
                  >
                    All Categories
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat._id}
                      onClick={() => setFilters({ ...filters, category: cat._id })}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-sm ${filters.category === cat._id ? "bg-green-100 text-green-700 font-medium" : "text-gray-600 hover:bg-gray-50"}`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort */}
              <div className="mb-5">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Sort By</h4>
                <select
                  value={filters.sort}
                  onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
                >
                  <option value="newest">Newest First</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>

              {/* Organic toggle */}
              <div className="mb-5">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.isOrganic}
                    onChange={(e) => setFilters({ ...filters, isOrganic: e.target.checked })}
                    className="w-4 h-4 text-green-600 rounded"
                  />
                  <span className="text-sm text-gray-700">Organic Only</span>
                  <FaLeaf className="text-green-500 text-xs" />
                </label>
              </div>

              {/* Price Range */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Price Range</h4>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice}
                    onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice}
                    onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm"
                  />
                </div>
                <button onClick={() => fetchProduce()} className="w-full mt-2 text-xs text-green-600 hover:text-green-700 font-medium">
                  Apply Price
                </button>
              </div>
            </div>
          </div>

          {/* Product Grid */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-500">
                {pagination.total} produce found
              </p>
            </div>

            {loading ? (
              <div className="flex justify-center py-20">
                <div className="w-10 h-10 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
              </div>
            ) : produce.length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center shadow-sm">
                <FaLeaf className="text-green-300 text-4xl mx-auto mb-4" />
                <p className="text-gray-500">No produce found. Try different filters.</p>
              </div>
            ) : (
              <>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {produce.map((item) => (
                    <div key={item._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all group">
                      <Link to={`/produce/${item._id}`}>
                        <div className="h-44 bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center relative overflow-hidden">
                          {item.images?.[0]?.url && !item.images[0].url.includes("placeholder") ? (
                            <img src={item.images[0].url} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                          ) : (
                            <FaLeaf className="text-green-300 text-4xl" />
                          )}
                          {item.isOrganic && (
                            <span className="absolute top-2 left-2 bg-green-500 text-white px-2 py-0.5 rounded-full text-[10px] font-medium">
                              Organic
                            </span>
                          )}
                        </div>
                      </Link>
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-1">
                          <Link to={`/produce/${item._id}`} className="font-semibold text-gray-800 hover:text-green-600 truncate">
                            {item.name}
                          </Link>
                        </div>
                        <p className="text-xs text-gray-500 mb-2">
                          {item.category?.name}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                          <GiFarmer className="text-amber-500" />
                          <span>{item.farmer?.farmDetails?.farmName || item.farmer?.name}</span>
                          {item.averageRating > 0 && (
                            <>
                              <span className="text-gray-300">|</span>
                              <FaStar className="text-yellow-400" />
                              <span>{item.averageRating.toFixed(1)}</span>
                            </>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-0.5 font-bold text-green-700">
                            <FaRupeeSign className="text-xs" />
                            {item.price}/{item.unit}
                          </span>
                          {user?.role === "customer" && (
                            <button
                              onClick={() => handleAddToCart(item._id)}
                              className="flex items-center gap-1.5 bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-green-700 transition-colors"
                            >
                              <FaShoppingCart className="text-[10px]" /> Add
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <button
                      onClick={() => fetchProduce(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className="p-2 rounded-lg border text-gray-600 hover:bg-gray-50 disabled:opacity-30"
                    >
                      <FaChevronLeft className="text-sm" />
                    </button>
                    {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        onClick={() => fetchProduce(p)}
                        className={`w-9 h-9 rounded-lg text-sm font-medium ${
                          p === pagination.page
                            ? "bg-green-600 text-white"
                            : "border text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                    <button
                      onClick={() => fetchProduce(pagination.page + 1)}
                      disabled={pagination.page === pagination.pages}
                      className="p-2 rounded-lg border text-gray-600 hover:bg-gray-50 disabled:opacity-30"
                    >
                      <FaChevronRight className="text-sm" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrowseProduce;

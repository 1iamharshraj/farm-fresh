import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/common/Navbar";
import API from "../../api/axios";
import toast from "react-hot-toast";
import {
  FaLeaf,
  FaRupeeSign,
  FaBox,
  FaImage,
  FaTimes,
  FaArrowLeft,
  FaSave,
} from "react-icons/fa";

const units = [
  { value: "kg", label: "Kilogram (kg)" },
  { value: "gram", label: "Gram (g)" },
  { value: "dozen", label: "Dozen" },
  { value: "piece", label: "Piece" },
  { value: "litre", label: "Litre (L)" },
  { value: "bundle", label: "Bundle" },
];

const growingMethods = [
  { value: "conventional", label: "Conventional" },
  { value: "organic", label: "Organic" },
  { value: "natural", label: "Natural" },
  { value: "hydroponic", label: "Hydroponic" },
];

const AddProduce = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    price: "",
    unit: "kg",
    quantityAvailable: "",
    minimumOrder: 1,
    harvestDate: "",
    shelfLife: "",
    isOrganic: false,
    growingMethod: "conventional",
    tags: "",
    images: [],
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await API.get("/produce/categories");
        setCategories(data.data);
      } catch {
        // If no categories, seed them
        try {
          await API.post("/produce/categories/seed");
          const { data } = await API.get("/produce/categories");
          setCategories(data.data);
        } catch (err) {
          toast.error("Failed to load categories");
        }
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        price: Number(formData.price),
        quantityAvailable: Number(formData.quantityAvailable),
        minimumOrder: Number(formData.minimumOrder),
        shelfLife: formData.shelfLife ? Number(formData.shelfLife) : undefined,
        tags: formData.tags
          ? formData.tags.split(",").map((t) => t.trim()).filter(Boolean)
          : [],
        images: formData.images.length > 0
          ? formData.images
          : [{ url: "https://via.placeholder.com/400x300?text=Farm+Produce", publicId: "placeholder" }],
      };

      await API.post("/produce", payload);
      toast.success("Produce listed successfully!");
      navigate("/farmer/produce");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add produce");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-sm";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1.5";

  return (
    <div className="min-h-screen bg-[#fafaf5]">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-600">
            <FaArrowLeft />
          </button>
          <h1 className="font-['Poppins'] text-2xl font-bold text-gray-900">
            Add New Produce
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="font-['Poppins'] font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FaLeaf className="text-green-500" /> Basic Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Produce Name *</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="e.g., Fresh Organic Tomatoes" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Description *</label>
                <textarea name="description" value={formData.description} onChange={handleChange} required placeholder="Describe your produce, freshness, quality..." rows={3} className={`${inputClass} resize-none`} />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Category *</label>
                  <select name="category" value={formData.category} onChange={handleChange} required className={`${inputClass} bg-white`}>
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Growing Method</label>
                  <select name="growingMethod" value={formData.growingMethod} onChange={handleChange} className={`${inputClass} bg-white`}>
                    {growingMethods.map((m) => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className={labelClass}>Tags (comma separated)</label>
                <input type="text" name="tags" value={formData.tags} onChange={handleChange} placeholder="e.g., organic, fresh, summer" className={inputClass} />
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="font-['Poppins'] font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FaRupeeSign className="text-green-500" /> Pricing & Quantity
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Price (Rs.) *</label>
                <input type="number" name="price" value={formData.price} onChange={handleChange} required min="0" step="0.5" placeholder="40" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Unit *</label>
                <select name="unit" value={formData.unit} onChange={handleChange} className={`${inputClass} bg-white`}>
                  {units.map((u) => (
                    <option key={u.value} value={u.value}>{u.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Quantity Available *</label>
                <input type="number" name="quantityAvailable" value={formData.quantityAvailable} onChange={handleChange} required min="0" placeholder="100" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Minimum Order</label>
                <input type="number" name="minimumOrder" value={formData.minimumOrder} onChange={handleChange} min="1" className={inputClass} />
              </div>
            </div>
          </div>

          {/* Freshness */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="font-['Poppins'] font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FaBox className="text-green-500" /> Freshness Details
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Harvest Date</label>
                <input type="date" name="harvestDate" value={formData.harvestDate} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Shelf Life (days)</label>
                <input type="number" name="shelfLife" value={formData.shelfLife} onChange={handleChange} min="1" placeholder="7" className={inputClass} />
              </div>
            </div>
            <div className="mt-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" name="isOrganic" checked={formData.isOrganic} onChange={handleChange} className="w-4 h-4 text-green-600 rounded focus:ring-green-500" />
                <span className="text-sm text-gray-700">This produce is certified organic</span>
              </label>
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-3">
            <button type="button" onClick={() => navigate(-1)} className="px-6 py-3 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 font-medium text-sm">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              <FaSave />
              {loading ? "Listing..." : "List Produce"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProduce;

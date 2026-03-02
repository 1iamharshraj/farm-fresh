import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import Navbar from "../../components/common/Navbar";
import toast from "react-hot-toast";
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaSave } from "react-icons/fa";
import { GiFarmer } from "react-icons/gi";

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    address: {
      street: user?.address?.street || "",
      city: user?.address?.city || "",
      state: user?.address?.state || "",
      pincode: user?.address?.pincode || "",
    },
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddressChange = (e) => {
    setFormData({
      ...formData,
      address: { ...formData.address, [e.target.name]: e.target.value },
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile(formData);
      toast.success("Profile updated!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-sm";

  return (
    <div className="min-h-screen bg-[#fafaf5]">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="font-['Poppins'] text-2xl font-bold text-gray-900 mb-6">
          My Profile
        </h1>

        {/* Profile Header */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              {user?.role === "farmer" ? (
                <GiFarmer className="text-amber-600 text-2xl" />
              ) : (
                <FaUser className="text-green-600 text-xl" />
              )}
            </div>
            <div>
              <h2 className="font-semibold text-lg text-gray-800">{user?.name}</h2>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">{user?.email}</span>
                <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                  {user?.role === "delivery_agent" ? "Delivery Partner" : user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  <FaUser className="inline mr-1.5 text-gray-400" />Name
                </label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  <FaPhone className="inline mr-1.5 text-gray-400" />Phone
                </label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className={inputClass} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                <FaEnvelope className="inline mr-1.5 text-gray-400" />Email
              </label>
              <input type="email" value={user?.email} disabled className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-500" />
            </div>

            <div className="border-t pt-4 mt-4">
              <h3 className="font-medium text-gray-700 mb-3">
                <FaMapMarkerAlt className="inline mr-1.5 text-gray-400" />Address
              </h3>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <input type="text" name="street" value={formData.address.street} onChange={handleAddressChange} placeholder="Street" className={inputClass} />
                </div>
                <input type="text" name="city" value={formData.address.city} onChange={handleAddressChange} placeholder="City" className={inputClass} />
                <input type="text" name="state" value={formData.address.state} onChange={handleAddressChange} placeholder="State" className={inputClass} />
                <input type="text" name="pincode" value={formData.address.pincode} onChange={handleAddressChange} placeholder="Pincode" className={inputClass} />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 mt-4"
            >
              <FaSave />
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;

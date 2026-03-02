import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import toast from "react-hot-toast";
import {
  FaLeaf,
  FaEnvelope,
  FaLock,
  FaUser,
  FaPhone,
  FaEye,
  FaEyeSlash,
  FaArrowRight,
  FaArrowLeft,
  FaShoppingBasket,
  FaTruck,
  FaMapMarkerAlt,
} from "react-icons/fa";
import { GiWheat } from "react-icons/gi";

const STEPS = {
  ROLE: 0,
  BASIC: 1,
  DETAILS: 2,
};

const roles = [
  {
    id: "customer",
    label: "Customer",
    desc: "Buy fresh produce from local farmers",
    icon: <FaShoppingBasket className="text-2xl" />,
    gradient: "from-green-500 to-emerald-600",
    border: "border-green-500",
    bg: "bg-green-50",
  },
  {
    id: "farmer",
    label: "Farmer",
    desc: "List and sell your farm produce",
    icon: <GiWheat className="text-2xl" />,
    gradient: "from-amber-500 to-orange-600",
    border: "border-amber-500",
    bg: "bg-amber-50",
  },
  {
    id: "delivery_agent",
    label: "Delivery Partner",
    desc: "Deliver orders and earn flexibly",
    icon: <FaTruck className="text-2xl" />,
    gradient: "from-blue-500 to-indigo-600",
    border: "border-blue-500",
    bg: "bg-blue-50",
  },
];

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(STEPS.ROLE);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    role: "",
    name: "",
    email: "",
    phone: "",
    password: "",
    address: { street: "", city: "", state: "", pincode: "" },
    farmDetails: { farmName: "", farmSize: "", description: "", specializations: [] },
    deliveryDetails: { vehicleType: "motorcycle", vehicleNumber: "", licenseNumber: "" },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      address: { ...prev.address, [name]: value },
    }));
  };

  const handleFarmChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      farmDetails: { ...prev.farmDetails, [name]: value },
    }));
  };

  const handleDeliveryChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      deliveryDetails: { ...prev.deliveryDetails, [name]: value },
    }));
  };

  const selectRole = (roleId) => {
    setFormData((prev) => ({ ...prev, role: roleId }));
    setStep(STEPS.BASIC);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: formData.role,
        address: formData.address,
      };

      if (formData.role === "farmer") {
        payload.farmDetails = formData.farmDetails;
      }
      if (formData.role === "delivery_agent") {
        payload.deliveryDetails = formData.deliveryDetails;
      }

      const user = await register(payload);
      toast.success(`Welcome to Farm Fresh, ${user.name}!`);

      const roleRoutes = {
        customer: "/browse",
        farmer: "/farmer/dashboard",
        delivery_agent: "/delivery/dashboard",
      };
      navigate(roleRoutes[user.role] || "/");
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm transition-all";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1.5";

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-[#fafaf5] to-amber-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <FaLeaf className="text-green-600 text-3xl" />
            <span className="font-['Poppins'] font-bold text-2xl text-green-800">
              Farm Fresh
            </span>
          </Link>
          <p className="mt-2 text-gray-500">Create your account</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {["Role", "Info", "Details"].map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  i <= step
                    ? "bg-green-600 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {i + 1}
              </div>
              <span className={`text-xs font-medium hidden sm:block ${i <= step ? "text-green-700" : "text-gray-400"}`}>
                {label}
              </span>
              {i < 2 && <div className={`w-8 h-0.5 ${i < step ? "bg-green-500" : "bg-gray-200"}`}></div>}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Step 1: Role Selection */}
          {step === STEPS.ROLE && (
            <div>
              <h2 className="font-['Poppins'] text-xl font-semibold text-gray-800 mb-6 text-center">
                I want to join as a...
              </h2>
              <div className="space-y-3">
                {roles.map((role) => (
                  <button
                    key={role.id}
                    onClick={() => selectRole(role.id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all hover:shadow-md ${
                      formData.role === role.id
                        ? `${role.border} ${role.bg}`
                        : "border-gray-100 hover:border-gray-200"
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${role.gradient} flex items-center justify-center text-white`}>
                      {role.icon}
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-gray-800">{role.label}</p>
                      <p className="text-sm text-gray-500">{role.desc}</p>
                    </div>
                    <FaArrowRight className="ml-auto text-gray-300" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Basic Info */}
          {step === STEPS.BASIC && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setStep(STEPS.DETAILS);
              }}
              className="space-y-4"
            >
              <h2 className="font-['Poppins'] text-xl font-semibold text-gray-800 mb-4">
                Basic Information
              </h2>

              <div>
                <label className={labelClass}>Full Name</label>
                <div className="relative">
                  <FaUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                  <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="John Doe" className={inputClass} />
                </div>
              </div>

              <div>
                <label className={labelClass}>Email Address</label>
                <div className="relative">
                  <FaEnvelope className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                  <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="you@example.com" className={inputClass} />
                </div>
              </div>

              <div>
                <label className={labelClass}>Phone Number</label>
                <div className="relative">
                  <FaPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required placeholder="9876543210" pattern="[6-9][0-9]{9}" className={inputClass} />
                </div>
              </div>

              <div>
                <label className={labelClass}>Password</label>
                <div className="relative">
                  <FaLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={6}
                    placeholder="Min 6 characters"
                    className={`${inputClass} pr-10`}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setStep(STEPS.ROLE)} className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 text-sm font-medium">
                  <FaArrowLeft /> Back
                </button>
                <button type="submit" className="flex-1 bg-green-600 text-white py-2.5 rounded-xl font-semibold hover:bg-green-700 transition-colors text-sm">
                  Continue
                </button>
              </div>
            </form>
          )}

          {/* Step 3: Role-Specific Details */}
          {step === STEPS.DETAILS && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h2 className="font-['Poppins'] text-xl font-semibold text-gray-800 mb-4">
                {formData.role === "farmer"
                  ? "Farm Details"
                  : formData.role === "delivery_agent"
                  ? "Vehicle Details"
                  : "Delivery Address"}
              </h2>

              {/* Address (all roles) */}
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className={labelClass}>Street Address</label>
                  <div className="relative">
                    <FaMapMarkerAlt className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                    <input type="text" name="street" value={formData.address.street} onChange={handleAddressChange} placeholder="123 Main Street" className={inputClass} />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>City</label>
                  <input type="text" name="city" value={formData.address.city} onChange={handleAddressChange} required placeholder="City" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-sm" />
                </div>
                <div>
                  <label className={labelClass}>State</label>
                  <input type="text" name="state" value={formData.address.state} onChange={handleAddressChange} required placeholder="State" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-sm" />
                </div>
                <div className="col-span-2">
                  <label className={labelClass}>Pincode</label>
                  <input type="text" name="pincode" value={formData.address.pincode} onChange={handleAddressChange} required placeholder="600001" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-sm" />
                </div>
              </div>

              {/* Farmer-specific fields */}
              {formData.role === "farmer" && (
                <div className="space-y-3 pt-2 border-t">
                  <div>
                    <label className={labelClass}>Farm Name</label>
                    <input type="text" name="farmName" value={formData.farmDetails.farmName} onChange={handleFarmChange} required placeholder="Green Valley Farm" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-sm" />
                  </div>
                  <div>
                    <label className={labelClass}>Farm Size</label>
                    <input type="text" name="farmSize" value={formData.farmDetails.farmSize} onChange={handleFarmChange} placeholder="e.g., 5 acres" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-sm" />
                  </div>
                  <div>
                    <label className={labelClass}>Description</label>
                    <textarea name="description" value={formData.farmDetails.description} onChange={handleFarmChange} placeholder="Tell us about your farm..." rows={3} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-sm resize-none" />
                  </div>
                </div>
              )}

              {/* Delivery agent-specific fields */}
              {formData.role === "delivery_agent" && (
                <div className="space-y-3 pt-2 border-t">
                  <div>
                    <label className={labelClass}>Vehicle Type</label>
                    <select name="vehicleType" value={formData.deliveryDetails.vehicleType} onChange={handleDeliveryChange} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-sm bg-white">
                      <option value="bicycle">Bicycle</option>
                      <option value="motorcycle">Motorcycle</option>
                      <option value="auto">Auto</option>
                      <option value="van">Van</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Vehicle Number</label>
                    <input type="text" name="vehicleNumber" value={formData.deliveryDetails.vehicleNumber} onChange={handleDeliveryChange} required placeholder="TN 01 AB 1234" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-sm" />
                  </div>
                  <div>
                    <label className={labelClass}>License Number</label>
                    <input type="text" name="licenseNumber" value={formData.deliveryDetails.licenseNumber} onChange={handleDeliveryChange} required placeholder="DL-1234567890" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-sm" />
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setStep(STEPS.BASIC)} className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 text-sm font-medium">
                  <FaArrowLeft /> Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-green-600 text-white py-2.5 rounded-xl font-semibold hover:bg-green-700 transition-colors text-sm disabled:opacity-50"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Creating Account...
                    </span>
                  ) : (
                    "Create Account"
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Already have an account?{" "}
              <Link to="/login" className="text-green-600 hover:text-green-700 font-semibold">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;

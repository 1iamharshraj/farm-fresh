import { useState } from "react";
import { Link } from "react-router-dom";
import API from "../../api/axios";
import toast from "react-hot-toast";
import { FaLeaf, FaEnvelope, FaArrowLeft } from "react-icons/fa";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post("/auth/forgot-password", { email });
      setSent(true);
      toast.success("Password reset link sent to your email");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-[#fafaf5] to-amber-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <FaLeaf className="text-green-600 text-3xl" />
            <span className="font-['Poppins'] font-bold text-2xl text-green-800">
              Farm Fresh
            </span>
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          {!sent ? (
            <>
              <h2 className="font-['Poppins'] text-xl font-semibold text-gray-800 mb-2">
                Forgot Password?
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                Enter your email and we'll send you a reset link.
              </p>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <FaEnvelope className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="you@example.com"
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {loading ? "Sending..." : "Send Reset Link"}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaEnvelope className="text-green-600 text-2xl" />
              </div>
              <h2 className="font-['Poppins'] text-xl font-semibold text-gray-800 mb-2">
                Check Your Email
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                We've sent a password reset link to <strong>{email}</strong>
              </p>
            </div>
          )}

          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm text-green-600 hover:text-green-700 font-medium"
            >
              <FaArrowLeft /> Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/common/Navbar";
import { useAuth } from "../../hooks/useAuth";
import { useCart } from "../../hooks/useCart";
import API from "../../api/axios";
import toast from "react-hot-toast";
import {
  FaMapMarkerAlt,
  FaCreditCard,
  FaRupeeSign,
  FaShieldAlt,
  FaLock,
  FaCheckCircle,
  FaTimes,
  FaMobile,
  FaWallet,
  FaMoneyBillWave,
} from "react-icons/fa";

const paymentMethods = [
  { id: "upi", label: "UPI", icon: <FaMobile className="text-purple-500" />, desc: "Google Pay, PhonePe, Paytm" },
  { id: "card", label: "Credit / Debit Card", icon: <FaCreditCard className="text-blue-500" />, desc: "Visa, Mastercard, Rupay" },
  { id: "wallet", label: "Wallet", icon: <FaWallet className="text-green-500" />, desc: "Paytm, Amazon Pay" },
  { id: "cod", label: "Cash on Delivery", icon: <FaMoneyBillWave className="text-amber-500" />, desc: "Pay when delivered" },
];

const Checkout = () => {
  const { user } = useAuth();
  const { cart, fetchCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentStep, setPaymentStep] = useState(0); // 0=form, 1=connecting, 2=processing, 3=success
  const [customerNote, setCustomerNote] = useState("");
  const [address, setAddress] = useState({
    street: user?.address?.street || "",
    city: user?.address?.city || "",
    state: user?.address?.state || "",
    pincode: user?.address?.pincode || "",
  });

  const deliveryFee = 30;
  const itemsTotal = cart.totalAmount || 0;
  const totalAmount = itemsTotal + deliveryFee;

  const handlePlaceOrder = async () => {
    if (!address.city || !address.state || !address.pincode) {
      toast.error("Please fill in your delivery address");
      return;
    }

    // If online payment, show dummy payment gateway
    if (paymentMethod !== "cod") {
      setShowPaymentModal(true);
      return;
    }

    await submitOrder();
  };

  const submitOrder = async (paidOnline = false) => {
    setLoading(true);
    try {
      const { data } = await API.post("/orders", {
        paymentMethod,
        paymentStatus: paidOnline ? "completed" : "pending",
        customerNote,
        deliveryAddress: address,
      });
      await fetchCart();
      toast.success("Order placed successfully!");
      navigate(`/orders/${data.data._id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  // Dummy payment gateway handler with 3-step progress
  const handleDummyPayment = () => {
    setPaymentStep(1); // Connecting...
    setTimeout(() => {
      setPaymentStep(2); // Processing...
      setTimeout(() => {
        setPaymentStep(3); // Success!
        setTimeout(async () => {
          setShowPaymentModal(false);
          setPaymentStep(0);
          await submitOrder(true); // paidOnline = true
        }, 1500);
      }, 1500);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#fafaf5]">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="font-['Poppins'] text-2xl font-bold text-gray-900 mb-6">
          Checkout
        </h1>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Address */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="font-['Poppins'] font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FaMapMarkerAlt className="text-green-500" /> Delivery Address
              </h2>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <input type="text" value={address.street} onChange={(e) => setAddress({ ...address, street: e.target.value })} placeholder="Street Address" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-sm" />
                </div>
                <input type="text" value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} placeholder="City" required className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-sm" />
                <input type="text" value={address.state} onChange={(e) => setAddress({ ...address, state: e.target.value })} placeholder="State" required className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-sm" />
                <input type="text" value={address.pincode} onChange={(e) => setAddress({ ...address, pincode: e.target.value })} placeholder="Pincode" required className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-sm" />
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="font-['Poppins'] font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FaCreditCard className="text-green-500" /> Payment Method
              </h2>
              <div className="space-y-2">
                {paymentMethods.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                      paymentMethod === method.id
                        ? "border-green-500 bg-green-50"
                        : "border-gray-100 hover:border-gray-200"
                    }`}
                  >
                    <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center">
                      {method.icon}
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-800 text-sm">{method.label}</p>
                      <p className="text-xs text-gray-500">{method.desc}</p>
                    </div>
                    <div className={`ml-auto w-5 h-5 rounded-full border-2 ${paymentMethod === method.id ? "border-green-500 bg-green-500" : "border-gray-300"} flex items-center justify-center`}>
                      {paymentMethod === method.id && <div className="w-2 h-2 bg-white rounded-full"></div>}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Note */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="font-semibold text-gray-800 mb-3 text-sm">Order Note (optional)</h2>
              <textarea
                value={customerNote}
                onChange={(e) => setCustomerNote(e.target.value)}
                placeholder="Any special instructions for delivery..."
                rows={2}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-sm resize-none"
              />
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 sticky top-20">
              <h2 className="font-['Poppins'] font-semibold text-gray-800 mb-4">
                Order Summary
              </h2>
              <div className="space-y-2 text-sm">
                {cart.items?.map((item) => (
                  <div key={item._id} className="flex justify-between text-gray-600">
                    <span className="truncate mr-2">{item.produce?.name} x{item.quantity}</span>
                    <span className="flex items-center whitespace-nowrap">
                      <FaRupeeSign className="text-[10px]" />{(item.priceAtAdd * item.quantity).toFixed(0)}
                    </span>
                  </div>
                ))}
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span className="flex items-center"><FaRupeeSign className="text-[10px]" />{itemsTotal.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Delivery Fee</span>
                    <span className="flex items-center"><FaRupeeSign className="text-[10px]" />{deliveryFee}</span>
                  </div>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between font-bold text-gray-800 text-base">
                    <span>Total</span>
                    <span className="flex items-center text-green-700">
                      <FaRupeeSign className="text-sm" />{totalAmount.toFixed(0)}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={loading}
                className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors mt-5 disabled:opacity-50"
              >
                {loading ? "Placing Order..." : `Place Order - Rs.${totalAmount.toFixed(0)}`}
              </button>

              <div className="flex items-center justify-center gap-2 mt-3 text-xs text-gray-400">
                <FaShieldAlt /> Secure checkout
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dummy Payment Gateway Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            {/* Header - Razorpay style */}
            <div className="bg-[#072654] p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
                  <FaShieldAlt className="text-[#072654] text-sm" />
                </div>
                <div>
                  <p className="text-white font-medium text-sm">Farm Fresh</p>
                  <p className="text-blue-200 text-xs">Order Payment</p>
                </div>
              </div>
              <button onClick={() => setShowPaymentModal(false)} className="text-white/60 hover:text-white">
                <FaTimes />
              </button>
            </div>

            <div className="p-6">
              {paymentStep > 0 ? (
                <div className="py-6">
                  {/* Step Progress */}
                  <div className="flex items-center justify-center gap-2 mb-8">
                    {["Connecting", "Processing", "Success"].map((label, i) => (
                      <div key={label} className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                          paymentStep > i + 1 ? "bg-green-500 text-white" : paymentStep === i + 1 ? "bg-[#072654] text-white" : "bg-gray-200 text-gray-400"
                        }`}>
                          {paymentStep > i + 1 ? "✓" : i + 1}
                        </div>
                        <span className={`text-[10px] font-medium ${paymentStep >= i + 1 ? "text-gray-800" : "text-gray-400"}`}>{label}</span>
                        {i < 2 && <div className={`w-6 h-0.5 ${paymentStep > i + 1 ? "bg-green-500" : "bg-gray-200"}`} />}
                      </div>
                    ))}
                  </div>

                  {paymentStep === 3 ? (
                    <div className="text-center">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FaCheckCircle className="text-green-500 text-3xl" />
                      </div>
                      <h3 className="font-['Poppins'] font-semibold text-gray-800 text-lg">Payment Successful!</h3>
                      <p className="text-sm text-gray-500 mt-1">Redirecting to order...</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="w-12 h-12 border-4 border-blue-200 border-t-[#072654] rounded-full animate-spin mx-auto mb-4"></div>
                      <h3 className="font-medium text-gray-800">
                        {paymentStep === 1 ? "Connecting to payment gateway..." : "Processing your payment..."}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">Please wait, do not close this window</p>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <div className="text-center mb-6">
                    <p className="text-3xl font-bold text-gray-800 flex items-center justify-center">
                      <FaRupeeSign className="text-xl" />{totalAmount.toFixed(0)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Amount to pay</p>
                  </div>

                  {paymentMethod === "upi" && (
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-medium text-gray-700 mb-1 block">UPI ID</label>
                        <input type="text" placeholder="yourname@upi" className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                      <div className="flex gap-2">
                        {["GPay", "PhonePe", "Paytm"].map((app) => (
                          <button key={app} className="flex-1 py-2 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50">
                            {app}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {paymentMethod === "card" && (
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-medium text-gray-700 mb-1 block">Card Number</label>
                        <input type="text" placeholder="4111 1111 1111 1111" maxLength={19} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-medium text-gray-700 mb-1 block">Expiry</label>
                          <input type="text" placeholder="MM/YY" maxLength={5} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-700 mb-1 block">CVV</label>
                          <input type="password" placeholder="123" maxLength={3} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentMethod === "wallet" && (
                    <div className="space-y-2">
                      {["Paytm Wallet", "Amazon Pay", "Mobikwik"].map((wallet) => (
                        <button key={wallet} className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm text-gray-700">
                          <FaWallet className="text-green-500" />
                          {wallet}
                        </button>
                      ))}
                    </div>
                  )}

                  <button
                    onClick={handleDummyPayment}
                    className="w-full bg-[#072654] text-white py-3 rounded-lg font-semibold mt-6 hover:bg-[#0a3470] transition-colors flex items-center justify-center gap-2"
                  >
                    <FaLock className="text-xs" />
                    Pay Rs.{totalAmount.toFixed(0)}
                  </button>

                  <div className="flex items-center justify-center gap-2 mt-3 text-[10px] text-gray-400">
                    <FaShieldAlt /> Secured by Razorpay
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;

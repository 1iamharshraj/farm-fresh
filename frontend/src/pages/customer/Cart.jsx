import { Link } from "react-router-dom";
import Navbar from "../../components/common/Navbar";
import { useCart } from "../../hooks/useCart";
import toast from "react-hot-toast";
import {
  FaShoppingCart,
  FaTrash,
  FaMinus,
  FaPlus,
  FaRupeeSign,
  FaArrowRight,
  FaLeaf,
} from "react-icons/fa";

const Cart = () => {
  const { cart, updateQuantity, removeItem, clearCart } = useCart();

  const handleUpdateQty = async (itemId, qty) => {
    try {
      await updateQuantity(itemId, qty);
    } catch {
      toast.error("Failed to update quantity");
    }
  };

  const handleRemove = async (itemId) => {
    try {
      await removeItem(itemId);
      toast.success("Item removed");
    } catch {
      toast.error("Failed to remove item");
    }
  };

  const handleClear = async () => {
    if (!window.confirm("Clear entire cart?")) return;
    try {
      await clearCart();
      toast.success("Cart cleared");
    } catch {
      toast.error("Failed to clear cart");
    }
  };

  const items = cart.items || [];

  return (
    <div className="min-h-screen bg-[#fafaf5]">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-['Poppins'] text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FaShoppingCart className="text-green-600" /> My Cart
          </h1>
          {items.length > 0 && (
            <button onClick={handleClear} className="text-sm text-red-500 hover:text-red-600 font-medium">
              Clear All
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaShoppingCart className="text-green-400 text-2xl" />
            </div>
            <h3 className="font-['Poppins'] text-lg font-semibold text-gray-800 mb-2">
              Your cart is empty
            </h3>
            <p className="text-gray-500 mb-6">Browse fresh produce from local farmers.</p>
            <Link to="/browse" className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-green-700">
              <FaLeaf /> Browse Produce
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-3">
              {items.map((item) => (
                <div key={item._id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex gap-4">
                  <div className="w-20 h-20 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    {item.produce?.images?.[0]?.url && !item.produce.images[0].url.includes("placeholder") ? (
                      <img src={item.produce.images[0].url} alt={item.produce.name} className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <FaLeaf className="text-green-300 text-xl" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link to={`/produce/${item.produce?._id}`} className="font-medium text-gray-800 hover:text-green-600 truncate block">
                      {item.produce?.name}
                    </Link>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {item.produce?.farmer?.farmDetails?.farmName || item.produce?.farmer?.name}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-gray-200 rounded-lg">
                        <button
                          onClick={() => handleUpdateQty(item._id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="px-2 py-1 hover:bg-gray-50 text-gray-600 disabled:opacity-30"
                        >
                          <FaMinus className="text-[10px]" />
                        </button>
                        <span className="px-3 py-1 text-sm font-medium">{item.quantity}</span>
                        <button
                          onClick={() => handleUpdateQty(item._id, item.quantity + 1)}
                          className="px-2 py-1 hover:bg-gray-50 text-gray-600"
                        >
                          <FaPlus className="text-[10px]" />
                        </button>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-green-700 flex items-center">
                          <FaRupeeSign className="text-xs" />
                          {(item.priceAtAdd * item.quantity).toFixed(0)}
                        </span>
                        <button onClick={() => handleRemove(item._id)} className="text-red-400 hover:text-red-600 p-1">
                          <FaTrash className="text-xs" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 sticky top-20">
                <h3 className="font-['Poppins'] font-semibold text-gray-800 mb-4">
                  Order Summary
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({items.length} items)</span>
                    <span className="flex items-center font-medium">
                      <FaRupeeSign className="text-xs" />{cart.totalAmount?.toFixed(0) || 0}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Delivery Fee</span>
                    <span className="text-green-600 font-medium">Calculated at checkout</span>
                  </div>
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between font-semibold text-gray-800">
                      <span>Total</span>
                      <span className="flex items-center text-green-700 text-lg">
                        <FaRupeeSign className="text-sm" />{cart.totalAmount?.toFixed(0) || 0}
                      </span>
                    </div>
                  </div>
                </div>
                <Link
                  to="/checkout"
                  className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors mt-5"
                >
                  Proceed to Checkout <FaArrowRight className="text-sm" />
                </Link>
                <Link to="/browse" className="block text-center text-sm text-green-600 hover:text-green-700 font-medium mt-3">
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;

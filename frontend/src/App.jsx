import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import ProtectedRoute from "./components/common/ProtectedRoute";

// Common pages
import LandingPage from "./pages/common/LandingPage";
import NotFound from "./pages/common/NotFound";
import Profile from "./pages/common/Profile";

// Auth pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";

// Farmer pages
import FarmerDashboard from "./pages/farmer/FarmerDashboard";
import AddProduce from "./pages/farmer/AddProduce";
import ManageProduce from "./pages/farmer/ManageProduce";

// Customer pages
import BrowseProduce from "./pages/customer/BrowseProduce";
import ProduceDetail from "./pages/customer/ProduceDetail";
import CartPage from "./pages/customer/Cart";
import Checkout from "./pages/customer/Checkout";
import CustomerOrders from "./pages/customer/CustomerOrders";
import OrderDetail from "./pages/customer/OrderDetail";

// Farmer order pages
import FarmerOrders from "./pages/farmer/FarmerOrders";

// Delivery pages
import DeliveryDashboard from "./pages/delivery/DeliveryDashboard";
import AvailableOrders from "./pages/delivery/AvailableOrders";
import ActiveDeliveries from "./pages/delivery/ActiveDeliveries";
import DeliveryEarnings from "./pages/delivery/Earnings";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                borderRadius: "12px",
                background: "#333",
                color: "#fff",
              },
            }}
          />
          <Routes>
            <Route path="/" element={<LandingPage />} />

            {/* Auth routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Profile (all authenticated users) */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            {/* Customer routes */}
            <Route path="/browse" element={<BrowseProduce />} />
            <Route path="/produce/:id" element={<ProduceDetail />} />
            <Route
              path="/cart"
              element={
                <ProtectedRoute roles={["customer"]}>
                  <CartPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/checkout"
              element={
                <ProtectedRoute roles={["customer"]}>
                  <Checkout />
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders"
              element={
                <ProtectedRoute roles={["customer"]}>
                  <CustomerOrders />
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders/:id"
              element={
                <ProtectedRoute>
                  <OrderDetail />
                </ProtectedRoute>
              }
            />

            {/* Farmer routes */}
            <Route
              path="/farmer/dashboard"
              element={
                <ProtectedRoute roles={["farmer"]}>
                  <FarmerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/farmer/produce"
              element={
                <ProtectedRoute roles={["farmer"]}>
                  <ManageProduce />
                </ProtectedRoute>
              }
            />
            <Route
              path="/farmer/produce/add"
              element={
                <ProtectedRoute roles={["farmer"]}>
                  <AddProduce />
                </ProtectedRoute>
              }
            />
            <Route
              path="/farmer/orders"
              element={
                <ProtectedRoute roles={["farmer"]}>
                  <FarmerOrders />
                </ProtectedRoute>
              }
            />

            {/* Delivery routes */}
            <Route
              path="/delivery/dashboard"
              element={
                <ProtectedRoute roles={["delivery_agent"]}>
                  <DeliveryDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/delivery/available"
              element={
                <ProtectedRoute roles={["delivery_agent"]}>
                  <AvailableOrders />
                </ProtectedRoute>
              }
            />
            <Route
              path="/delivery/active"
              element={
                <ProtectedRoute roles={["delivery_agent"]}>
                  <ActiveDeliveries />
                </ProtectedRoute>
              }
            />
            <Route
              path="/delivery/earnings"
              element={
                <ProtectedRoute roles={["delivery_agent"]}>
                  <DeliveryEarnings />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/common/ProtectedRoute";

// Common pages
import LandingPage from "./pages/common/LandingPage";
import NotFound from "./pages/common/NotFound";
import Profile from "./pages/common/Profile";

// Auth pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";

// Role dashboards
import FarmerDashboard from "./pages/farmer/FarmerDashboard";
import AddProduce from "./pages/farmer/AddProduce";
import ManageProduce from "./pages/farmer/ManageProduce";
import DeliveryDashboard from "./pages/delivery/DeliveryDashboard";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
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

          {/* Delivery routes */}
          <Route
            path="/delivery/dashboard"
            element={
              <ProtectedRoute roles={["delivery_agent"]}>
                <DeliveryDashboard />
              </ProtectedRoute>
            }
          />

          {/* Customer routes - Phase 4 */}

          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

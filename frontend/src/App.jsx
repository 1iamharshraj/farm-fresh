import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import LandingPage from "./pages/common/LandingPage";
import NotFound from "./pages/common/NotFound";

function App() {
  return (
    <BrowserRouter>
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

        {/* Auth routes - Phase 2 */}
        {/* <Route path="/login" element={<Login />} /> */}
        {/* <Route path="/register" element={<Register />} /> */}

        {/* Farmer routes - Phase 3 */}
        {/* Customer routes - Phase 4 */}
        {/* Delivery routes - Phase 7 */}

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import {
  FaLeaf,
  FaUser,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaHome,
  FaStore,
  FaTruck,
  FaShoppingCart,
  FaChartBar,
  FaBox,
} from "react-icons/fa";
import { GiFarmer } from "react-icons/gi";

const roleNavItems = {
  customer: [
    { path: "/", label: "Home", icon: <FaHome /> },
    { path: "/browse", label: "Browse", icon: <FaStore /> },
    { path: "/cart", label: "Cart", icon: <FaShoppingCart /> },
    { path: "/orders", label: "Orders", icon: <FaBox /> },
  ],
  farmer: [
    { path: "/farmer/dashboard", label: "Dashboard", icon: <FaHome /> },
    { path: "/farmer/produce", label: "My Produce", icon: <FaStore /> },
    { path: "/farmer/orders", label: "Orders", icon: <FaBox /> },
    { path: "/farmer/analytics", label: "Analytics", icon: <FaChartBar /> },
  ],
  delivery_agent: [
    { path: "/delivery/dashboard", label: "Dashboard", icon: <FaHome /> },
    { path: "/delivery/available", label: "Available", icon: <FaBox /> },
    { path: "/delivery/active", label: "Deliveries", icon: <FaTruck /> },
    { path: "/delivery/earnings", label: "Earnings", icon: <FaChartBar /> },
  ],
};

const roleIcons = {
  customer: <FaUser className="text-green-600" />,
  farmer: <GiFarmer className="text-amber-600" />,
  delivery_agent: <FaTruck className="text-blue-600" />,
};

const roleBadgeColors = {
  customer: "bg-green-100 text-green-700",
  farmer: "bg-amber-100 text-amber-700",
  delivery_agent: "bg-blue-100 text-blue-700",
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const navItems = user ? roleNavItems[user.role] || [] : [];

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to={user ? navItems[0]?.path || "/" : "/"} className="flex items-center gap-2">
            <FaLeaf className="text-green-600 text-2xl" />
            <span className="font-['Poppins'] font-bold text-xl text-green-800">
              Farm Fresh
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="flex items-center gap-1.5 text-gray-600 hover:text-green-600 transition-colors text-sm font-medium"
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-3">
            {user && (
              <>
                <span className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${roleBadgeColors[user.role]}`}>
                  {roleIcons[user.role]}
                  {user.role === "delivery_agent" ? "Delivery" : user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </span>
                <Link
                  to="/profile"
                  className="flex items-center gap-2 text-gray-700 hover:text-green-600 transition-colors"
                >
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <FaUser className="text-green-600 text-xs" />
                  </div>
                  <span className="hidden sm:block text-sm font-medium">{user.name}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-gray-400 hover:text-red-500 transition-colors p-2"
                  title="Logout"
                >
                  <FaSignOutAlt />
                </button>
              </>
            )}
            {/* Mobile menu toggle */}
            <button
              className="md:hidden text-gray-600 p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-4 py-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 text-gray-600 hover:bg-green-50 hover:text-green-600 rounded-lg transition-colors text-sm"
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

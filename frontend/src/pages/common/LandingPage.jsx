import { Link } from "react-router-dom";
import {
  FaLeaf,
  FaTruck,
  FaUsers,
  FaSeedling,
  FaShoppingBasket,
  FaMapMarkerAlt,
  FaStar,
  FaArrowRight,
  FaPhone,
  FaEnvelope,
  FaHeart,
} from "react-icons/fa";
import { GiFarmer, GiWheat, GiFruitBowl } from "react-icons/gi";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[#fafaf5]">
      {/* Navbar */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <FaLeaf className="text-green-600 text-2xl" />
              <span className="font-['Poppins'] font-bold text-xl text-green-800">
                Farm Fresh
              </span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#how-it-works" className="text-gray-600 hover:text-green-600 transition-colors text-sm font-medium">
                How It Works
              </a>
              <a href="#features" className="text-gray-600 hover:text-green-600 transition-colors text-sm font-medium">
                Features
              </a>
              <a href="#roles" className="text-gray-600 hover:text-green-600 transition-colors text-sm font-medium">
                Join Us
              </a>
              <Link
                to="/login"
                className="text-green-700 hover:text-green-800 font-medium text-sm"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="bg-green-600 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-green-700 transition-colors shadow-md hover:shadow-lg"
              >
                Get Started
              </Link>
            </div>
            {/* Mobile menu button */}
            <div className="md:hidden">
              <Link
                to="/register"
                className="bg-green-600 text-white px-4 py-2 rounded-full text-sm font-medium"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-[#fafaf5] to-amber-50"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
                <FaSeedling className="text-green-500" />
                Farm to Table, Made Simple
              </div>
              <h1 className="font-['Poppins'] text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Fresh From The
                <span className="text-green-600"> Farm</span>
                <br />
                To Your
                <span className="text-amber-500"> Doorstep</span>
              </h1>
              <p className="mt-6 text-lg text-gray-600 leading-relaxed max-w-lg">
                Connect directly with local farmers. Get fresh, organic produce
                delivered to your home. No middlemen, fair prices, and
                guaranteed freshness.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 bg-green-600 text-white px-8 py-3.5 rounded-full font-semibold hover:bg-green-700 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                >
                  Start Shopping
                  <FaArrowRight className="text-sm" />
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 border-2 border-green-600 text-green-700 px-8 py-3.5 rounded-full font-semibold hover:bg-green-50 transition-all"
                >
                  <GiFarmer className="text-lg" />
                  Sell Your Produce
                </Link>
              </div>
              <div className="mt-10 flex items-center gap-8">
                <div className="text-center">
                  <p className="font-['Poppins'] text-2xl font-bold text-green-700">500+</p>
                  <p className="text-sm text-gray-500">Local Farmers</p>
                </div>
                <div className="w-px h-10 bg-gray-200"></div>
                <div className="text-center">
                  <p className="font-['Poppins'] text-2xl font-bold text-green-700">10K+</p>
                  <p className="text-sm text-gray-500">Happy Customers</p>
                </div>
                <div className="w-px h-10 bg-gray-200"></div>
                <div className="text-center">
                  <p className="font-['Poppins'] text-2xl font-bold text-green-700">50+</p>
                  <p className="text-sm text-gray-500">Localities</p>
                </div>
              </div>
            </div>
            <div className="relative hidden lg:block">
              <div className="relative w-full h-[500px]">
                {/* Decorative farm illustration using CSS shapes */}
                <div className="absolute top-8 right-8 w-80 h-80 bg-green-100 rounded-full opacity-60"></div>
                <div className="absolute bottom-12 left-8 w-48 h-48 bg-amber-100 rounded-full opacity-60"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-3xl shadow-2xl p-8 w-[350px]">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <GiFruitBowl className="text-green-600 text-xl" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">Fresh Vegetables</p>
                      <p className="text-sm text-gray-500">From Ravi's Farm</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {[
                      { name: "Organic Tomatoes", price: "40/kg", color: "bg-red-100 text-red-600" },
                      { name: "Fresh Spinach", price: "30/bundle", color: "bg-green-100 text-green-600" },
                      { name: "Farm Eggs", price: "80/dozen", color: "bg-amber-100 text-amber-600" },
                    ].map((item) => (
                      <div key={item.name} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 ${item.color.split(" ")[0]} rounded-lg flex items-center justify-center`}>
                            <FaLeaf className={item.color.split(" ")[1]} />
                          </div>
                          <span className="text-sm font-medium text-gray-700">{item.name}</span>
                        </div>
                        <span className="text-sm font-bold text-green-600">Rs.{item.price}</span>
                      </div>
                    ))}
                  </div>
                  <button className="mt-4 w-full bg-green-600 text-white py-2.5 rounded-xl font-medium hover:bg-green-700 transition-colors">
                    Order Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-green-600 font-medium text-sm uppercase tracking-wider">Simple Process</span>
            <h2 className="font-['Poppins'] text-3xl sm:text-4xl font-bold text-gray-900 mt-2">
              How Farm Fresh Works
            </h2>
            <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
              Three simple steps to get fresh produce from local farms delivered
              right to your doorstep.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                icon: <FaMapMarkerAlt className="text-2xl" />,
                title: "Discover Local Farms",
                desc: "Browse produce from farmers in your area. Filter by category, organic certification, and freshness.",
                color: "from-green-500 to-green-600",
                bg: "bg-green-50",
              },
              {
                step: "02",
                icon: <FaShoppingBasket className="text-2xl" />,
                title: "Order Fresh Produce",
                desc: "Add items to your cart and checkout securely. Pay with UPI, card, or cash on delivery.",
                color: "from-amber-500 to-amber-600",
                bg: "bg-amber-50",
              },
              {
                step: "03",
                icon: <FaTruck className="text-2xl" />,
                title: "Fast Local Delivery",
                desc: "A delivery partner picks up your order and brings it to your door. Track in real time.",
                color: "from-emerald-500 to-emerald-600",
                bg: "bg-emerald-50",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="relative group"
              >
                <div className={`${item.bg} rounded-2xl p-8 h-full transition-all hover:shadow-lg hover:-translate-y-1`}>
                  <span className="font-['Poppins'] text-5xl font-bold text-gray-100 absolute top-4 right-6">
                    {item.step}
                  </span>
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${item.color} flex items-center justify-center text-white mb-6`}>
                    {item.icon}
                  </div>
                  <h3 className="font-['Poppins'] text-xl font-semibold text-gray-800 mb-3">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-gradient-to-b from-[#fafaf5] to-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-green-600 font-medium text-sm uppercase tracking-wider">Why Choose Us</span>
            <h2 className="font-['Poppins'] text-3xl sm:text-4xl font-bold text-gray-900 mt-2">
              Fresh, Fair & Fast
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <FaSeedling className="text-green-500 text-2xl" />,
                title: "100% Fresh",
                desc: "Produce harvested and delivered within 24 hours",
              },
              {
                icon: <GiFarmer className="text-amber-600 text-2xl" />,
                title: "Support Farmers",
                desc: "Farmers earn 40-60% more without middlemen",
              },
              {
                icon: <FaMapMarkerAlt className="text-emerald-500 text-2xl" />,
                title: "Hyperlocal",
                desc: "Connect with farms within your neighbourhood",
              },
              {
                icon: <FaStar className="text-yellow-500 text-2xl" />,
                title: "Quality Rated",
                desc: "Community reviews ensure quality standards",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100"
              >
                <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="font-['Poppins'] font-semibold text-gray-800 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Join As - Role Selection */}
      <section id="roles" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-green-600 font-medium text-sm uppercase tracking-wider">Get Started</span>
            <h2 className="font-['Poppins'] text-3xl sm:text-4xl font-bold text-gray-900 mt-2">
              Join The Farm Fresh Community
            </h2>
            <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
              Whether you grow, buy, or deliver — there's a place for you.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <FaShoppingBasket className="text-3xl" />,
                role: "Customer",
                tagline: "Buy Fresh, Buy Local",
                perks: [
                  "Browse local farm produce",
                  "Get doorstep delivery",
                  "Track orders in real time",
                  "Rate and review farmers",
                ],
                color: "green",
                gradient: "from-green-500 to-emerald-600",
              },
              {
                icon: <GiWheat className="text-3xl" />,
                role: "Farmer",
                tagline: "Sell Direct, Earn More",
                perks: [
                  "List your produce instantly",
                  "Set your own prices",
                  "Reach local customers",
                  "Track sales & analytics",
                ],
                color: "amber",
                gradient: "from-amber-500 to-orange-600",
              },
              {
                icon: <FaTruck className="text-3xl" />,
                role: "Delivery Partner",
                tagline: "Deliver & Earn",
                perks: [
                  "Flexible working hours",
                  "Earn per delivery",
                  "Optimized routes",
                  "Daily earnings dashboard",
                ],
                color: "blue",
                gradient: "from-blue-500 to-indigo-600",
              },
            ].map((card) => (
              <div
                key={card.role}
                className="group relative bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1"
              >
                <div className={`h-2 bg-gradient-to-r ${card.gradient}`}></div>
                <div className="p-8">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${card.gradient} flex items-center justify-center text-white mb-6`}>
                    {card.icon}
                  </div>
                  <h3 className="font-['Poppins'] text-2xl font-bold text-gray-800">
                    {card.role}
                  </h3>
                  <p className="text-gray-500 mt-1 mb-6">{card.tagline}</p>
                  <ul className="space-y-3 mb-8">
                    {card.perks.map((perk) => (
                      <li key={perk} className="flex items-center gap-3 text-gray-600 text-sm">
                        <div className={`w-5 h-5 rounded-full bg-${card.color}-100 flex items-center justify-center flex-shrink-0`}>
                          <FaLeaf className={`text-${card.color}-500 text-[10px]`} />
                        </div>
                        {perk}
                      </li>
                    ))}
                  </ul>
                  <Link
                    to="/register"
                    className={`block text-center bg-gradient-to-r ${card.gradient} text-white py-3 rounded-xl font-medium hover:opacity-90 transition-opacity`}
                  >
                    Join as {card.role}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Banner */}
      <section className="bg-gradient-to-r from-green-700 to-green-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "500+", label: "Active Farmers", icon: <GiFarmer className="text-green-300 text-2xl" /> },
              { value: "10,000+", label: "Orders Delivered", icon: <FaTruck className="text-green-300 text-2xl" /> },
              { value: "50+", label: "Localities Served", icon: <FaMapMarkerAlt className="text-green-300 text-2xl" /> },
              { value: "4.8", label: "Average Rating", icon: <FaStar className="text-yellow-400 text-2xl" /> },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="flex justify-center mb-3">{stat.icon}</div>
                <p className="font-['Poppins'] text-3xl font-bold text-white">{stat.value}</p>
                <p className="text-green-200 text-sm mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <FaLeaf className="text-green-400 text-xl" />
                <span className="font-['Poppins'] font-bold text-lg text-white">
                  Farm Fresh
                </span>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">
                Connecting local farmers directly with consumers. Fresh produce,
                fair prices, fast delivery.
              </p>
              <div className="flex items-center gap-2 mt-4 text-sm text-gray-400">
                <FaHeart className="text-red-400 text-xs" />
                Made for Indian Farmers
              </div>
            </div>
            <div>
              <h4 className="font-['Poppins'] font-semibold text-white mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#how-it-works" className="hover:text-green-400 transition-colors">How It Works</a></li>
                <li><a href="#features" className="hover:text-green-400 transition-colors">Features</a></li>
                <li><a href="#roles" className="hover:text-green-400 transition-colors">Join Us</a></li>
                <li><Link to="/login" className="hover:text-green-400 transition-colors">Login</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-['Poppins'] font-semibold text-white mb-4">For Users</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/register" className="hover:text-green-400 transition-colors">Shop Produce</Link></li>
                <li><Link to="/register" className="hover:text-green-400 transition-colors">Become a Farmer</Link></li>
                <li><Link to="/register" className="hover:text-green-400 transition-colors">Deliver With Us</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-['Poppins'] font-semibold text-white mb-4">Contact</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <FaEnvelope className="text-green-400 text-xs" /> support@farmfresh.in
                </li>
                <li className="flex items-center gap-2">
                  <FaPhone className="text-green-400 text-xs" /> +91 98765 43210
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-sm text-gray-500">
            <p>&copy; {new Date().getFullYear()} Farm Fresh. All rights reserved. | TARP Project - VIT</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  FaLeaf,
  FaTruck,
  FaSeedling,
  FaShoppingBasket,
  FaMapMarkerAlt,
  FaStar,
  FaArrowRight,
  FaPhone,
  FaEnvelope,
  FaHeart,
  FaShieldAlt,
  FaClock,
  FaCheckCircle,
} from "react-icons/fa";
import { GiFarmer, GiWheat, GiFruitBowl } from "react-icons/gi";

/* ── Intersection Observer hook for scroll animations ── */
const useInView = (options = {}) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.unobserve(entry.target);
      }
    }, { threshold: 0.15, ...options });

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return [ref, isVisible];
};

/* ── Animated counter ── */
const AnimatedCounter = ({ end, suffix = "", duration = 2000 }) => {
  const [count, setCount] = useState(0);
  const [ref, isVisible] = useInView();

  useEffect(() => {
    if (!isVisible) return;
    const numEnd = parseInt(end.replace(/,/g, ""));
    const step = numEnd / (duration / 16);
    let current = 0;
    const timer = setInterval(() => {
      current += step;
      if (current >= numEnd) {
        setCount(numEnd);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [isVisible, end, duration]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}{suffix}
    </span>
  );
};

const LandingPage = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const [howRef, howVisible] = useInView();
  const [featRef, featVisible] = useInView();
  const [roleRef, roleVisible] = useInView();
  const [statsRef, statsVisible] = useInView();
  const [ctaRef, ctaVisible] = useInView();

  return (
    <div className="min-h-screen bg-[#fafaf5] overflow-hidden">
      {/* ════════════ NAVBAR ════════════ */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrollY > 50
            ? "bg-white/90 backdrop-blur-lg shadow-lg"
            : "bg-transparent"
        }`}
      >
        <div className="page-container">
          <div className="flex justify-between items-center h-18 py-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/25 animate-fade-in-down">
                <FaLeaf className="text-white text-lg" />
              </div>
              <span className="font-['Poppins'] font-extrabold text-xl tracking-tight text-green-800 animate-fade-in-down delay-100 animate-on-load">
                Farm Fresh
              </span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#how-it-works" className="text-gray-600 hover:text-green-600 transition-colors text-sm font-medium relative group">
                How It Works
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-500 transition-all duration-300 group-hover:w-full"></span>
              </a>
              <a href="#features" className="text-gray-600 hover:text-green-600 transition-colors text-sm font-medium relative group">
                Features
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-500 transition-all duration-300 group-hover:w-full"></span>
              </a>
              <a href="#roles" className="text-gray-600 hover:text-green-600 transition-colors text-sm font-medium relative group">
                Join Us
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-500 transition-all duration-300 group-hover:w-full"></span>
              </a>
              <Link
                to="/login"
                className="text-green-700 hover:text-green-800 font-semibold text-sm transition-colors"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:shadow-lg hover:shadow-green-500/30 hover:-translate-y-0.5 transition-all duration-300"
              >
                Get Started
              </Link>
            </div>
            {/* Mobile menu */}
            <div className="md:hidden flex items-center gap-3">
              <Link to="/login" className="text-green-700 font-semibold text-sm">
                Log In
              </Link>
              <Link
                to="/register"
                className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-5 py-2 rounded-full text-sm font-semibold"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ════════════ HERO SECTION ════════════ */}
      <section className="relative overflow-hidden pt-28 sm:pt-32 lg:pt-36 pb-16 sm:pb-20 lg:pb-24">
        {/* Background decorations */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-50/80 via-[#fafaf5] to-amber-50/60"></div>
        <div
          className="absolute top-20 -left-32 w-96 h-96 bg-green-200/30 rounded-full blur-3xl animate-pulse-soft"
          style={{ transform: `translateY(${scrollY * 0.1}px)` }}
        ></div>
        <div
          className="absolute bottom-0 -right-32 w-80 h-80 bg-amber-200/30 rounded-full blur-3xl animate-pulse-soft delay-500"
          style={{ transform: `translateY(${scrollY * -0.08}px)` }}
        ></div>
        <div className="absolute top-40 right-1/4 w-4 h-4 bg-green-400 rounded-full animate-float opacity-40"></div>
        <div className="absolute top-60 left-1/4 w-3 h-3 bg-amber-400 rounded-full animate-float-slow opacity-50"></div>
        <div className="absolute bottom-40 right-1/3 w-2 h-2 bg-emerald-500 rounded-full animate-bounce-gentle opacity-30"></div>

        <div className="relative page-container">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left: Text Content */}
            <div>
              <div className="animate-fade-in-up animate-on-load">
                <div className="inline-flex items-center gap-2 bg-green-100/80 text-green-700 px-5 py-2 rounded-full text-sm font-semibold mb-6 shadow-sm">
                  <FaSeedling className="text-green-500 animate-bounce-gentle" />
                  Farm to Table, Made Simple
                </div>
              </div>

              <h1 className="font-['Poppins'] text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-gray-900 leading-[1.15] tracking-tight animate-fade-in-up animate-on-load delay-200">
                Fresh From The
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-500"> Farm</span>
                <br />
                To Your
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500"> Doorstep</span>
              </h1>

              <p className="mt-6 text-lg sm:text-xl text-gray-500 leading-relaxed max-w-lg font-light animate-fade-in-up animate-on-load delay-400">
                Connect directly with local farmers. Get fresh, organic produce
                delivered to your home. No middlemen, fair prices, and
                guaranteed freshness.
              </p>

              <div className="mt-8 flex flex-wrap gap-5 animate-fade-in-up animate-on-load delay-500">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center gap-2.5 px-8 py-3.5 font-semibold rounded-full bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-md shadow-green-500/25 hover:shadow-lg hover:shadow-green-500/35 hover:-translate-y-0.5 transition-all duration-300 text-base group"
                >
                  Start Shopping
                  <FaArrowRight className="text-sm group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center gap-2.5 px-8 py-3.5 font-semibold rounded-full border-2 border-green-600 text-green-700 hover:bg-green-50 hover:-translate-y-0.5 transition-all duration-300 text-base group"
                >
                  <GiFarmer className="text-xl group-hover:animate-wiggle" />
                  Sell Your Produce
                </Link>
              </div>

              {/* Trust badges */}
              <div className="mt-12 flex items-center gap-6 sm:gap-10 animate-fade-in-up animate-on-load delay-700">
                <div className="text-center">
                  <p className="font-['Poppins'] text-2xl sm:text-3xl font-extrabold text-green-700">500+</p>
                  <p className="text-xs sm:text-sm text-gray-400 font-medium mt-0.5">Local Farmers</p>
                </div>
                <div className="w-px h-12 bg-gray-200"></div>
                <div className="text-center">
                  <p className="font-['Poppins'] text-2xl sm:text-3xl font-extrabold text-green-700">10K+</p>
                  <p className="text-xs sm:text-sm text-gray-400 font-medium mt-0.5">Happy Customers</p>
                </div>
                <div className="w-px h-12 bg-gray-200"></div>
                <div className="text-center">
                  <p className="font-['Poppins'] text-2xl sm:text-3xl font-extrabold text-green-700">50+</p>
                  <p className="text-xs sm:text-sm text-gray-400 font-medium mt-0.5">Localities</p>
                </div>
              </div>
            </div>

            {/* Right: Floating Product Card */}
            <div className="relative hidden lg:block">
              <div className="relative w-full h-[520px]">
                {/* Decorative circles */}
                <div
                  className="absolute top-4 right-4 w-72 h-72 bg-gradient-to-br from-green-200/50 to-emerald-100/30 rounded-full blur-sm animate-pulse-soft"
                  style={{ transform: `translateY(${scrollY * 0.05}px)` }}
                ></div>
                <div
                  className="absolute bottom-16 left-4 w-52 h-52 bg-gradient-to-br from-amber-200/50 to-yellow-100/30 rounded-full blur-sm animate-pulse-soft delay-300"
                  style={{ transform: `translateY(${scrollY * -0.05}px)` }}
                ></div>

                {/* Floating mini badges */}
                <div className="absolute top-16 -left-2 bg-white rounded-2xl shadow-xl px-4 py-3 flex items-center gap-3 animate-float-slow z-10">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <FaCheckCircle className="text-green-500" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-800">100% Organic</p>
                    <p className="text-[10px] text-gray-400">Certified Fresh</p>
                  </div>
                </div>

                <div className="absolute bottom-24 -right-2 bg-white rounded-2xl shadow-xl px-4 py-3 flex items-center gap-3 animate-float z-10">
                  <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                    <FaStar className="text-amber-500" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-800">4.8 Rating</p>
                    <p className="text-[10px] text-gray-400">10K+ Reviews</p>
                  </div>
                </div>

                {/* Main product card */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-3xl shadow-2xl w-[360px] p-7 hover-lift animate-scale-in animate-on-load delay-500">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-14 h-14 bg-gradient-to-br from-green-100 to-emerald-50 rounded-2xl flex items-center justify-center">
                      <GiFruitBowl className="text-green-600 text-2xl" />
                    </div>
                    <div>
                      <p className="font-['Poppins'] font-bold text-gray-800">Fresh Vegetables</p>
                      <p className="text-sm text-gray-400">From Ravi's Farm</p>
                    </div>
                    <span className="ml-auto text-[10px] font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-full">FRESH</span>
                  </div>
                  <div className="space-y-3">
                    {[
                      { name: "Organic Tomatoes", price: "40/kg", emoji: "\ud83c\udf45", bg: "bg-red-50" },
                      { name: "Fresh Spinach", price: "30/bundle", emoji: "\ud83e\udd6c", bg: "bg-green-50" },
                      { name: "Farm Eggs", price: "80/dozen", emoji: "\ud83e\udd5a", bg: "bg-amber-50" },
                    ].map((item) => (
                      <div
                        key={item.name}
                        className="flex items-center justify-between bg-gray-50/80 rounded-2xl px-4 py-3.5 hover:bg-gray-100/80 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 ${item.bg} rounded-xl flex items-center justify-center text-lg`}>
                            {item.emoji}
                          </div>
                          <span className="text-sm font-semibold text-gray-700">{item.name}</span>
                        </div>
                        <span className="text-sm font-bold text-green-600">Rs.{item.price}</span>
                      </div>
                    ))}
                  </div>
                  <button className="mt-5 w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3.5 rounded-2xl font-semibold hover:shadow-lg hover:shadow-green-500/25 transition-all duration-300 active:scale-[0.98]">
                    Order Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 80L60 68.3C120 56.7 240 33.3 360 26.7C480 20 600 30 720 38.3C840 46.7 960 53.3 1080 48.3C1200 43.3 1320 26.7 1380 18.3L1440 10V80H1380C1320 80 1200 80 1080 80C960 80 840 80 720 80C600 80 480 80 360 80C240 80 120 80 60 80H0Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* ════════════ HOW IT WORKS ════════════ */}
      <section id="how-it-works" className="py-20 lg:py-24 bg-white" ref={howRef}>
        <div className="page-container">
          <div className={`text-center mb-14 transition-all duration-700 ${howVisible ? "animate-fade-in-up" : "opacity-0"}`}>
            <span className="inline-block text-green-600 font-bold text-sm uppercase tracking-[0.2em] bg-green-50 px-4 py-1.5 rounded-full">
              Simple Process
            </span>
            <h2 className="font-['Poppins'] text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 mt-4 tracking-tight">
              How Farm Fresh Works
            </h2>
            <p className="mt-4 text-gray-500 max-w-2xl mx-auto text-lg font-light">
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
                shadow: "shadow-green-500/10",
              },
              {
                step: "02",
                icon: <FaShoppingBasket className="text-2xl" />,
                title: "Order Fresh Produce",
                desc: "Add items to your cart and checkout securely. Pay with UPI, card, or cash on delivery.",
                color: "from-amber-500 to-amber-600",
                bg: "bg-amber-50",
                shadow: "shadow-amber-500/10",
              },
              {
                step: "03",
                icon: <FaTruck className="text-2xl" />,
                title: "Fast Local Delivery",
                desc: "A delivery partner picks up your order and brings it to your door. Track in real time.",
                color: "from-emerald-500 to-emerald-600",
                bg: "bg-emerald-50",
                shadow: "shadow-emerald-500/10",
              },
            ].map((item, i) => (
              <div
                key={item.step}
                className={`relative group transition-all duration-700 ${
                  howVisible ? "animate-fade-in-up" : "opacity-0"
                }`}
                style={{ animationDelay: `${(i + 1) * 200}ms` }}
              >
                <div className={`${item.bg} rounded-3xl p-7 lg:p-8 h-full transition-all duration-300 hover:shadow-2xl ${item.shadow} hover:-translate-y-2 border border-transparent hover:border-white relative overflow-hidden`}>
                  {/* Background step number */}
                  <span className="font-['Poppins'] text-[100px] font-black text-gray-100/80 absolute -top-4 -right-2 leading-none select-none">
                    {item.step}
                  </span>
                  <div className={`relative z-10 w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    {item.icon}
                  </div>
                  <h3 className="relative z-10 font-['Poppins'] text-xl lg:text-2xl font-bold text-gray-800 mb-3">
                    {item.title}
                  </h3>
                  <p className="relative z-10 text-gray-500 leading-relaxed text-base">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Connecting dots */}
          <div className="hidden md:flex justify-center mt-8 gap-4">
            {[1, 2, 3].map((dot) => (
              <div key={dot} className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${howVisible ? "bg-green-400" : "bg-gray-200"}`} style={{ transitionDelay: `${dot * 300}ms` }}></div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════ FEATURES ════════════ */}
      <section id="features" className="py-20 lg:py-24 bg-gradient-to-b from-[#fafaf5] to-green-50/50 relative" ref={featRef}>
        {/* Decorative elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-green-200/20 rounded-full blur-xl"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-amber-200/20 rounded-full blur-xl"></div>

        <div className="page-container">
          <div className={`text-center mb-12 transition-all duration-700 ${featVisible ? "animate-fade-in-up" : "opacity-0"}`}>
            <span className="inline-block text-green-600 font-bold text-sm uppercase tracking-[0.2em] bg-green-50 px-4 py-1.5 rounded-full">
              Why Choose Us
            </span>
            <h2 className="font-['Poppins'] text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 mt-4 tracking-tight">
              Fresh, Fair & Fast
            </h2>
            <p className="mt-4 text-gray-500 max-w-xl mx-auto text-lg font-light">
              We are building the most trusted farm-to-table platform in India.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {[
              {
                icon: <FaSeedling className="text-green-500 text-2xl" />,
                title: "100% Fresh",
                desc: "Produce harvested and delivered within 24 hours",
                bg: "group-hover:bg-green-50",
              },
              {
                icon: <GiFarmer className="text-amber-600 text-2xl" />,
                title: "Support Farmers",
                desc: "Farmers earn 40-60% more without middlemen",
                bg: "group-hover:bg-amber-50",
              },
              {
                icon: <FaShieldAlt className="text-blue-500 text-2xl" />,
                title: "Secure Payments",
                desc: "UPI, card, and COD with full order protection",
                bg: "group-hover:bg-blue-50",
              },
              {
                icon: <FaClock className="text-purple-500 text-2xl" />,
                title: "Real-time Tracking",
                desc: "Track your order from farm to your doorstep live",
                bg: "group-hover:bg-purple-50",
              },
            ].map((feature, i) => (
              <div
                key={feature.title}
                className={`group bg-white rounded-3xl p-7 lg:p-8 shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100 hover:border-transparent hover:-translate-y-2 ${
                  featVisible ? "animate-fade-in-up" : "opacity-0"
                }`}
                style={{ animationDelay: `${(i + 1) * 150}ms` }}
              >
                <div className={`w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mb-5 ${feature.bg} transition-colors duration-300 group-hover:scale-110 transform`}>
                  {feature.icon}
                </div>
                <h3 className="font-['Poppins'] font-bold text-gray-800 mb-2 text-lg">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════ JOIN AS - ROLE SELECTION ════════════ */}
      <section id="roles" className="py-20 lg:py-24 bg-white relative overflow-hidden" ref={roleRef}>
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-green-50 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-amber-50 rounded-full blur-3xl opacity-50"></div>

        <div className="page-container relative z-10">
          <div className={`text-center mb-12 transition-all duration-700 ${roleVisible ? "animate-fade-in-up" : "opacity-0"}`}>
            <span className="inline-block text-green-600 font-bold text-sm uppercase tracking-[0.2em] bg-green-50 px-4 py-1.5 rounded-full">
              Get Started
            </span>
            <h2 className="font-['Poppins'] text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 mt-4 tracking-tight">
              Join The Farm Fresh Community
            </h2>
            <p className="mt-4 text-gray-500 max-w-2xl mx-auto text-lg font-light">
              Whether you grow, buy, or deliver — there's a place for you.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-10">
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
                gradient: "from-green-500 to-emerald-600",
                checkColor: "text-green-500",
                borderHover: "hover:border-green-200",
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
                gradient: "from-amber-500 to-orange-600",
                checkColor: "text-amber-500",
                borderHover: "hover:border-amber-200",
                popular: true,
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
                gradient: "from-blue-500 to-indigo-600",
                checkColor: "text-blue-500",
                borderHover: "hover:border-blue-200",
              },
            ].map((card, i) => (
              <div
                key={card.role}
                className={`group relative bg-white rounded-3xl border-2 border-gray-100 ${card.borderHover} overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 ${
                  roleVisible ? "animate-fade-in-up" : "opacity-0"
                }`}
                style={{ animationDelay: `${(i + 1) * 200}ms` }}
              >
                {/* Top gradient bar */}
                <div className={`h-1.5 bg-gradient-to-r ${card.gradient}`}></div>

                {/* Popular badge */}
                {card.popular && (
                  <div className="absolute top-6 right-6">
                    <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">
                      Popular
                    </span>
                  </div>
                )}

                <div className="p-8 lg:p-10">
                  <div className={`w-[72px] h-[72px] rounded-3xl bg-gradient-to-br ${card.gradient} flex items-center justify-center text-white mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                    {card.icon}
                  </div>
                  <h3 className="font-['Poppins'] text-2xl font-extrabold text-gray-800">
                    {card.role}
                  </h3>
                  <p className="text-gray-400 mt-1 mb-6 font-medium">{card.tagline}</p>
                  <ul className="space-y-4 mb-8">
                    {card.perks.map((perk) => (
                      <li key={perk} className="flex items-center gap-3 text-gray-600 text-sm">
                        <FaCheckCircle className={`${card.checkColor} flex-shrink-0`} />
                        {perk}
                      </li>
                    ))}
                  </ul>
                  <Link
                    to="/register"
                    className={`block text-center bg-gradient-to-r ${card.gradient} text-white py-3.5 rounded-2xl font-semibold hover:opacity-90 hover:shadow-lg transition-all duration-300 active:scale-[0.98]`}
                  >
                    Join as {card.role}
                    <FaArrowRight className="inline ml-2 text-xs" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════ STATS BANNER ════════════ */}
      <section className="py-14 lg:py-16 relative overflow-hidden" ref={statsRef}>
        <div className="absolute inset-0 bg-gradient-to-r from-green-700 via-green-800 to-emerald-900"></div>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full" style={{backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(255,255,255,0.15) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(255,255,255,0.1) 0%, transparent 50%)'}}></div>
        </div>

        <div className="relative page-container">
          <div className={`grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12 text-center ${statsVisible ? "animate-fade-in-up" : "opacity-0"}`}>
            {[
              { value: "500", suffix: "+", label: "Active Farmers", icon: <GiFarmer className="text-green-300 text-3xl" /> },
              { value: "10,000", suffix: "+", label: "Orders Delivered", icon: <FaTruck className="text-green-300 text-3xl" /> },
              { value: "50", suffix: "+", label: "Localities Served", icon: <FaMapMarkerAlt className="text-green-300 text-3xl" /> },
              { value: "4.8", suffix: "", label: "Average Rating", icon: <FaStar className="text-yellow-400 text-3xl" /> },
            ].map((stat, i) => (
              <div
                key={stat.label}
                className="flex flex-col items-center gap-3"
                style={{ animationDelay: `${i * 150}ms` }}
              >
                <div className="hover:scale-110 transition-transform duration-300">
                  {stat.icon}
                </div>
                <p className="font-['Poppins'] text-3xl sm:text-4xl font-extrabold text-white">
                  {statsVisible ? <AnimatedCounter end={stat.value} suffix={stat.suffix} /> : "0"}
                </p>
                <p className="text-green-200/80 text-sm font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════ CTA SECTION ════════════ */}
      <section className="py-20 lg:py-24 bg-[#fafaf5] relative overflow-hidden" ref={ctaRef}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-green-100/30 rounded-full blur-3xl"></div>
        <div
          className={`page-container text-center relative z-10 transition-all duration-700 ${ctaVisible ? "animate-fade-in-up" : "opacity-0"}`}
          style={{ maxWidth: "48rem" }}
        >
          <h2 className="font-['Poppins'] text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight">
            Ready to Experience
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-500"> Farm Fresh</span>?
          </h2>
          <p className="mt-6 text-gray-500 text-lg max-w-2xl mx-auto font-light">
            Join thousands of happy customers and farmers already on our platform. Start your journey today.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-5">
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2.5 px-8 py-3.5 font-semibold rounded-full bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-md shadow-green-500/25 hover:shadow-lg hover:shadow-green-500/35 hover:-translate-y-0.5 transition-all duration-300 text-base group"
            >
              Get Started Free
              <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 font-semibold rounded-full border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:-translate-y-0.5 transition-all duration-300 text-base"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* ════════════ FOOTER ════════════ */}
      <footer className="bg-gray-900 text-gray-300 pt-16 pb-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 via-emerald-500 to-amber-500"></div>

        <div className="page-container">
          <div className="grid md:grid-cols-4 gap-10 lg:gap-12">
            <div className="md:col-span-1">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-9 h-9 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                  <FaLeaf className="text-white text-sm" />
                </div>
                <span className="font-['Poppins'] font-extrabold text-lg text-white">
                  Farm Fresh
                </span>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">
                Connecting local farmers directly with consumers. Fresh produce,
                fair prices, fast delivery.
              </p>
              <div className="flex items-center gap-2 mt-5 text-sm text-gray-400">
                <FaHeart className="text-red-400 text-xs animate-pulse" />
                Made for Indian Farmers
              </div>
            </div>
            <div>
              <h4 className="font-['Poppins'] font-bold text-white mb-5 text-sm uppercase tracking-wider">Quick Links</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#how-it-works" className="text-gray-400 hover:text-green-400 transition-colors duration-300">How It Works</a></li>
                <li><a href="#features" className="text-gray-400 hover:text-green-400 transition-colors duration-300">Features</a></li>
                <li><a href="#roles" className="text-gray-400 hover:text-green-400 transition-colors duration-300">Join Us</a></li>
                <li><Link to="/login" className="text-gray-400 hover:text-green-400 transition-colors duration-300">Login</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-['Poppins'] font-bold text-white mb-5 text-sm uppercase tracking-wider">For Users</h4>
              <ul className="space-y-3 text-sm">
                <li><Link to="/register" className="text-gray-400 hover:text-green-400 transition-colors duration-300">Shop Produce</Link></li>
                <li><Link to="/register" className="text-gray-400 hover:text-green-400 transition-colors duration-300">Become a Farmer</Link></li>
                <li><Link to="/register" className="text-gray-400 hover:text-green-400 transition-colors duration-300">Deliver With Us</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-['Poppins'] font-bold text-white mb-5 text-sm uppercase tracking-wider">Contact</h4>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-3 text-gray-400">
                  <FaEnvelope className="text-green-400 text-xs" /> support@farmfresh.in
                </li>
                <li className="flex items-center gap-3 text-gray-400">
                  <FaPhone className="text-green-400 text-xs" /> +91 98765 43210
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-6 text-center text-sm text-gray-500">
            <p>&copy; {new Date().getFullYear()} Farm Fresh. All rights reserved. | TARP Project - VIT</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

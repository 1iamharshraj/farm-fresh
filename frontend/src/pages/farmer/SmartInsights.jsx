import { useState, useEffect } from "react";
import Navbar from "../../components/common/Navbar";
import API from "../../api/axios";
import toast from "react-hot-toast";
import {
  FaRupeeSign,
  FaChartLine,
  FaArrowUp,
  FaArrowDown,
  FaMinus,
  FaLightbulb,
  FaBox,
  FaTags,
} from "react-icons/fa";

const SmartInsights = () => {
  const [forecast, setForecast] = useState(null);
  const [prices, setPrices] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("forecast");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [forecastRes, priceRes] = await Promise.all([
          API.get("/smart/demand-forecast"),
          API.get("/smart/price-suggestions"),
        ]);
        setForecast(forecastRes.data.data);
        setPrices(priceRes.data.data);
      } catch {
        toast.error("Failed to load insights");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const trendIcon = (label) => {
    if (label === "rising") return <FaArrowUp className="text-green-500" />;
    if (label === "declining") return <FaArrowDown className="text-red-500" />;
    return <FaMinus className="text-gray-400" />;
  };

  const trendColor = (label) => {
    if (label === "rising") return "text-green-600 bg-green-50";
    if (label === "declining") return "text-red-600 bg-red-50";
    return "text-gray-600 bg-gray-50";
  };

  return (
    <div className="min-h-screen bg-[#fafaf5]">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
            <FaLightbulb className="text-purple-600" />
          </div>
          <div>
            <h1 className="font-['Poppins'] text-2xl font-bold text-gray-900">
              Smart Insights
            </h1>
            <p className="text-sm text-gray-500">AI-powered demand forecasting and pricing</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setTab("forecast")}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
              tab === "forecast"
                ? "bg-purple-600 text-white"
                : "bg-white text-gray-600 border hover:bg-gray-50"
            }`}
          >
            <FaChartLine className="inline mr-1.5" />
            Demand Forecast
          </button>
          <button
            onClick={() => setTab("pricing")}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
              tab === "pricing"
                ? "bg-purple-600 text-white"
                : "bg-white text-gray-600 border hover:bg-gray-50"
            }`}
          >
            <FaTags className="inline mr-1.5" />
            Price Suggestions
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
          </div>
        ) : tab === "forecast" ? (
          <>
            {/* Summary Cards */}
            {forecast?.summary && (
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
                  <p className="text-2xl font-bold text-gray-800 font-['Poppins']">
                    {forecast.summary.totalProducts}
                  </p>
                  <p className="text-xs text-gray-500">Products Tracked</p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
                  <p className="text-2xl font-bold text-green-600 font-['Poppins']">
                    {forecast.summary.risingProducts}
                  </p>
                  <p className="text-xs text-gray-500">Rising Demand</p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
                  <p className="text-2xl font-bold text-red-600 font-['Poppins']">
                    {forecast.summary.decliningProducts}
                  </p>
                  <p className="text-xs text-gray-500">Declining Demand</p>
                </div>
              </div>
            )}

            {/* Forecast Cards */}
            {forecast?.forecasts?.length > 0 ? (
              <div className="space-y-4">
                {forecast.forecasts.map((item) => (
                  <div
                    key={item.product}
                    className="bg-white rounded-xl p-5 shadow-sm border border-gray-100"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                          <FaBox className="text-purple-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800">{item.product}</h3>
                          <p className="text-xs text-gray-500">
                            {item.totalSold} sold | Rs.{item.totalRevenue} revenue
                          </p>
                        </div>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${trendColor(item.trendLabel)}`}
                      >
                        {trendIcon(item.trendLabel)}
                        {item.trend > 0 ? "+" : ""}
                        {item.trend}%
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                      <div>
                        <p className="text-gray-400 text-xs">Avg Daily</p>
                        <p className="font-semibold text-gray-800">
                          {item.avgDailyDemand} units
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs">7-Day Forecast</p>
                        <p className="font-semibold text-gray-800">
                          {item.forecast7Days} units
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs">Trend</p>
                        <p className="font-semibold capitalize text-gray-800">
                          {item.trendLabel}
                        </p>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg px-4 py-2.5 text-sm text-gray-600 flex items-center gap-2">
                      <FaLightbulb className="text-amber-500 flex-shrink-0" />
                      {item.recommendation}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl p-12 text-center shadow-sm">
                <FaChartLine className="text-gray-300 text-4xl mx-auto mb-4" />
                <p className="text-gray-500">
                  No sales data yet. Forecasts will appear after you complete some orders.
                </p>
              </div>
            )}
          </>
        ) : (
          /* Price Suggestions Tab */
          <>
            {prices?.length > 0 ? (
              <div className="space-y-4">
                {prices.map((item) => (
                  <div
                    key={item.product}
                    className="bg-white rounded-xl p-5 shadow-sm border border-gray-100"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-800">{item.product}</h3>
                      <span className="flex items-center text-lg font-bold text-green-700">
                        <FaRupeeSign className="text-sm" />
                        {item.currentPrice}/{item.unit}
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-4 text-sm mb-3">
                      <div>
                        <p className="text-gray-400 text-xs">Market Avg</p>
                        <p className="font-semibold text-gray-800 flex items-center">
                          <FaRupeeSign className="text-[8px]" />
                          {item.market.avgPrice}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs">Market Min</p>
                        <p className="font-semibold text-gray-800 flex items-center">
                          <FaRupeeSign className="text-[8px]" />
                          {item.market.minPrice}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs">Market Max</p>
                        <p className="font-semibold text-gray-800 flex items-center">
                          <FaRupeeSign className="text-[8px]" />
                          {item.market.maxPrice}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs">Competitors</p>
                        <p className="font-semibold text-gray-800">
                          {item.market.listings}
                        </p>
                      </div>
                    </div>

                    <div
                      className={`rounded-lg px-4 py-2.5 text-sm flex items-center gap-2 ${
                        item.priceDiffPercent > 20
                          ? "bg-red-50 text-red-700"
                          : item.priceDiffPercent < -20
                          ? "bg-green-50 text-green-700"
                          : "bg-blue-50 text-blue-700"
                      }`}
                    >
                      <FaLightbulb className="text-amber-500 flex-shrink-0" />
                      {item.suggestion}
                      {item.priceDiffPercent !== 0 && (
                        <span className="ml-auto font-medium">
                          ({item.priceDiffPercent > 0 ? "+" : ""}
                          {item.priceDiffPercent}% vs market)
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl p-12 text-center shadow-sm">
                <FaTags className="text-gray-300 text-4xl mx-auto mb-4" />
                <p className="text-gray-500">
                  No products listed yet. Add products to see price suggestions.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SmartInsights;

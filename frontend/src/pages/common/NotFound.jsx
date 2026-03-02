import { Link } from "react-router-dom";
import { FaLeaf, FaHome } from "react-icons/fa";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-[#fafaf5] flex items-center justify-center px-4">
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
            <FaLeaf className="text-green-500 text-4xl" />
          </div>
        </div>
        <h1 className="font-['Poppins'] text-6xl font-bold text-green-600 mb-2">
          404
        </h1>
        <h2 className="font-['Poppins'] text-2xl font-semibold text-gray-800 mb-4">
          Page Not Found
        </h2>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">
          Looks like this page has gone to seed. Let's get you back to the farm.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-full font-medium hover:bg-green-700 transition-colors shadow-md"
        >
          <FaHome />
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;

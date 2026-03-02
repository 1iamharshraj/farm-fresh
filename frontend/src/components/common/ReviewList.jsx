import { FaStar, FaCheckCircle } from "react-icons/fa";

const ReviewList = ({ reviews }) => {
  if (!reviews || reviews.length === 0) {
    return (
      <p className="text-sm text-gray-400 text-center py-4">No reviews yet</p>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div
          key={review._id}
          className="border-b border-gray-100 pb-4 last:border-0"
        >
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-green-100 rounded-full flex items-center justify-center text-xs font-bold text-green-700">
                {review.customer?.name?.charAt(0) || "?"}
              </div>
              <span className="text-sm font-medium text-gray-800">
                {review.customer?.name || "Customer"}
              </span>
              {review.isVerified && (
                <FaCheckCircle className="text-green-500 text-xs" title="Verified purchase" />
              )}
            </div>
            <span className="text-xs text-gray-400">
              {new Date(review.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>

          <div className="flex gap-0.5 mb-1 ml-9">
            {[1, 2, 3, 4, 5].map((star) => (
              <FaStar
                key={star}
                className={`text-sm ${
                  star <= review.rating ? "text-yellow-400" : "text-gray-200"
                }`}
              />
            ))}
          </div>

          {review.comment && (
            <p className="text-sm text-gray-600 ml-9">{review.comment}</p>
          )}
        </div>
      ))}
    </div>
  );
};

export default ReviewList;

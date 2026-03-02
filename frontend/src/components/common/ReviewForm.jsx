import { useState } from "react";
import API from "../../api/axios";
import toast from "react-hot-toast";
import { FaStar } from "react-icons/fa";

const ReviewForm = ({ orderId, onReviewSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await API.post("/reviews", { orderId, rating, comment });
      toast.success("Review submitted!");
      if (onReviewSubmitted) onReviewSubmitted(data.data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Your Rating</p>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
              className="p-1 transition-transform hover:scale-110"
            >
              <FaStar
                className={`text-2xl ${
                  star <= (hover || rating)
                    ? "text-yellow-400"
                    : "text-gray-200"
                }`}
              />
            </button>
          ))}
          {rating > 0 && (
            <span className="ml-2 text-sm text-gray-500 self-center">
              {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][rating]}
            </span>
          )}
        </div>
      </div>

      <div>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience... (optional)"
          rows={3}
          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-sm resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={submitting || rating === 0}
        className="w-full bg-green-600 text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-green-700 transition-colors disabled:opacity-50"
      >
        {submitting ? "Submitting..." : "Submit Review"}
      </button>
    </form>
  );
};

export default ReviewForm;

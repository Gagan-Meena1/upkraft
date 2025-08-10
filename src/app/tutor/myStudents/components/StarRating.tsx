import { Star } from "lucide-react";

export const StarRating: React.FC<{ rating: number }> = ({ rating }) => {
  return (
    <div className="flex space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={20}
          className={`${
            star <= rating
              ? "fill-[#FFC357] text-[#FFC357]"
              : "fill-white text-[#505050]"
          } transition-colors duration-200`}
        />
      ))}
    </div>
  );
};

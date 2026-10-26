"use client";

import React from "react";
import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  interactive?: boolean;
  onChange?: (rating: number) => void;
  size?: "sm" | "md" | "lg";
}

export default function StarRating({
  rating,
  maxRating = 5,
  interactive = false,
  onChange,
  size = "md"
}: StarRatingProps) {
  const sizeClasses = {
    sm: "w-3.5 h-3.5",
    md: "w-4 h-4",
    lg: "w-6 h-6"
  };

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: maxRating }).map((_, index) => {
        const starValue = index + 1;
        const isFilled = starValue <= rating;

        return (
          <button
            key={index}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onChange && onChange(starValue)}
            className={`${interactive ? "cursor-pointer transition-transform hover:scale-110" : "cursor-default"} text-amber-400`}
          >
            <Star
              className={`${sizeClasses[size]} ${
                isFilled ? "fill-amber-400 text-amber-400" : "text-zinc-300 dark:text-zinc-600"
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}

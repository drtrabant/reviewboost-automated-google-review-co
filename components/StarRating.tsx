"use client";

import { useEffect, useRef, useState } from "react";

interface StarRatingProps {
  rating: number;
  maxStars?: number;
  size?: "sm" | "md" | "lg" | "xl";
  animated?: boolean;
  showValue?: boolean;
  className?: string;
  delay?: number;
}

const sizeMap = {
  sm: "w-4 h-4",
  md: "w-6 h-6",
  lg: "w-8 h-8",
  xl: "w-10 h-10",
};

const textSizeMap = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-xl",
  xl: "text-2xl",
};

function Star({
  fillPercentage,
  size,
  index,
  animated,
  isVisible,
  delay,
}: {
  fillPercentage: number;
  size: "sm" | "md" | "lg" | "xl";
  index: number;
  animated: boolean;
  isVisible: boolean;
  delay: number;
}) {
  const clipId = `star-clip-${index}-${Math.random().toString(36).slice(2, 9)}`;
  const gradientId = `star-gradient-${index}-${Math.random().toString(36).slice(2, 9)}`;

  const currentFill = animated ? (isVisible ? fillPercentage : 0) : fillPercentage;

  return (
    <svg
      className={`${sizeMap[size]} flex-shrink-0`}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{
        transitionDelay: animated ? `${delay + index * 150}ms` : "0ms",
      }}
    >
      <defs>
        <clipPath id={clipId}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </clipPath>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop
            offset={`${currentFill}%`}
            stopColor="#F59E0B"
            style={{
              transition: animated ? "stop-color 0.5s ease-out, offset 0.7s ease-out" : "none",
            }}
          />
          <stop
            offset={`${currentFill}%`}
            stopColor="#D1D5DB"
            style={{
              transition: animated ? "stop-color 0.5s ease-out, offset 0.7s ease-out" : "none",
            }}
          />
        </linearGradient>
      </defs>

      {/* Background empty star */}
      <path
        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
        fill="#D1D5DB"
      />

      {/* Filled overlay using clip rect for precise partial fill */}
      <g clipPath={`url(#${clipId})`}>
        <rect
          x="0"
          y="0"
          width={`${(currentFill / 100) * 24}`}
          height="24"
          fill="#F59E0B"
          style={{
            transition: animated ? `width 0.7s ease-out ${delay + index * 150}ms` : "none",
          }}
        />
      </g>

      {/* Star outline for definition */}
      <path
        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
        fill="none"
        stroke="#F59E0B"
        strokeWidth="0.5"
        opacity={currentFill > 0 ? 1 : 0.3}
        style={{
          transition: animated ? `opacity 0.5s ease-out ${delay + index * 150}ms` : "none",
        }}
      />
    </svg>
  );
}

export default function StarRating({
  rating,
  maxStars = 5,
  size = "md",
  animated = true,
  showValue = false,
  className = "",
  delay = 0,
}: StarRatingProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(!animated);

  // Clamp rating between 0 and maxStars
  const clampedRating = Math.max(0, Math.min(rating, maxStars));

  useEffect(() => {
    if (!animated || !containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.3,
        rootMargin: "0px 0px -50px 0px",
      }
    );

    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, [animated]);

  const stars = Array.from({ length: maxStars }, (_, i) => {
    const starIndex = i + 1;
    let fillPercentage: number;

    if (clampedRating >= starIndex) {
      fillPercentage = 100;
    } else if (clampedRating > starIndex - 1) {
      fillPercentage = (clampedRating - (starIndex - 1)) * 100;
    } else {
      fillPercentage = 0;
    }

    return fillPercentage;
  });

  return (
    <div
      ref={containerRef}
      className={`inline-flex items-center gap-1 ${className}`}
      role="img"
      aria-label={`${clampedRating} out of ${maxStars} stars`}
    >
      <div className="flex items-center gap-0.5">
        {stars.map((fillPercentage, index) => (
          <Star
            key={index}
            fillPercentage={fillPercentage}
            size={size}
            index={index}
            animated={animated}
            isVisible={isVisible}
            delay={delay}
          />
        ))}
      </div>
      {showValue && (
        <span
          className={`${textSizeMap[size]} font-semibold text-gray-900 ml-1.5 tabular-nums`}
          style={{
            opacity: animated ? (isVisible ? 1 : 0) : 1,
            transition: animated
              ? `opacity 0.5s ease-out ${delay + maxStars * 150 + 100}ms`
              : "none",
          }}
        >
          {clampedRating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
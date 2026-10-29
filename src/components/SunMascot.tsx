"use client";

import React from "react";

interface SunMascotProps {
  className?: string;
  size?: number;
}

export function SunMascot({ className = "", size }: SunMascotProps) {
  return (
    <div
      className={`inline-block relative select-none ${className}`}
      style={size ? { width: size, height: size } : undefined}
      aria-label="Nourish Sun Mascot"
    >
      <svg
        viewBox="0 0 160 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full overflow-visible"
      >
        {/* Animated ambient glow */}
        <circle cx="80" cy="80" r="60" fill="#F8B739" opacity="0.15" />

        {/* Polygon Sun Rays */}
        <g className="origin-center transition-transform duration-700">
          {/* 12 Sun rays radiating outward */}
          <polygon points="80,10 86,28 74,28" fill="#F8B739" />
          <polygon points="115,19 114,37 104,31" fill="#F8B739" />
          <polygon points="141,45 133,60 126,51" fill="#F8B739" />
          <polygon points="150,80 132,86 132,74" fill="#F8B739" />
          <polygon points="141,115 126,109 133,100" fill="#F8B739" />
          <polygon points="115,141 104,129 114,123" fill="#F8B739" />
          <polygon points="80,150 74,132 86,132" fill="#F8B739" />
          <polygon points="45,141 46,123 56,129" fill="#F8B739" />
          <polygon points="19,115 34,100 27,109" fill="#F8B739" />
          <polygon points="10,80 28,74 28,86" fill="#F8B739" />
          <polygon points="19,45 27,51 34,60" fill="#F8B739" />
          <polygon points="45,19 56,31 46,37" fill="#F8B739" />
        </g>

        {/* Limbs / Arms */}
        {/* Left Arm waving up */}
        <path
          d="M 45 88 Q 30 76 25 64"
          stroke="#1C1C1E"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
        />
        {/* Right Arm resting happily */}
        <path
          d="M 115 88 Q 130 92 135 84"
          stroke="#1C1C1E"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
        />
        {/* Left Foot */}
        <path
          d="M 68 128 Q 66 138 60 142"
          stroke="#1C1C1E"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
        />
        {/* Right Foot */}
        <path
          d="M 92 128 Q 94 138 100 142"
          stroke="#1C1C1E"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
        />

        {/* Main Sun Face Circle */}
        <circle cx="80" cy="80" r="48" fill="#F49E23" />
        {/* Inner subtle gradient ring */}
        <circle cx="80" cy="80" r="45" fill="#F8B739" opacity="0.4" />

        {/* Rosy Cheeks */}
        <ellipse cx="58" cy="88" rx="7" ry="4.5" fill="#F4694C" opacity="0.45" />
        <ellipse cx="102" cy="88" rx="7" ry="4.5" fill="#F4694C" opacity="0.45" />

        {/* Friendly Eyes */}
        <circle cx="64" cy="74" r="4" fill="#1C1C1E" />
        <circle cx="96" cy="74" r="4" fill="#1C1C1E" />
        {/* Eye highlights */}
        <circle cx="62.5" cy="72.5" r="1.3" fill="#FFFFFF" />
        <circle cx="94.5" cy="72.5" r="1.3" fill="#FFFFFF" />

        {/* Happy Smile */}
        <path
          d="M 69 88 Q 80 100 91 88"
          stroke="#1C1C1E"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    </div>
  );
}

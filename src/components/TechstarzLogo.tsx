import React from 'react';

interface TechstarzLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showDomain?: boolean;
}

export const TechstarzLogo: React.FC<TechstarzLogoProps> = ({
  className = '',
  size = 'md',
  showDomain = true
}) => {
  const dimensions = {
    sm: { height: 28, width: showDomain ? 140 : 40 },
    md: { height: 36, width: showDomain ? 180 : 50 },
    lg: { height: 52, width: showDomain ? 240 : 70 }
  }[size];

  return (
    <div className={`flex items-center gap-2 select-none ${className}`}>
      {/* Hand-lettered stylized vector badge inspired by the bold script reference image */}
      <svg
        viewBox="0 0 160 110"
        className="shrink-0 overflow-visible"
        style={{ height: dimensions.height, width: (dimensions.height * 160) / 110 }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id="logoShadow" x="-10%" y="-10%" width="130%" height="130%">
            <feDropShadow dx="3" dy="5" stdDeviation="1.5" floodColor="#000000" floodOpacity="0.8" />
          </filter>
          <linearGradient id="starGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>

        {/* 3D Black Extruded Background Silhouette mimicking heavy lettering shadow */}
        <g filter="url(#logoShadow)">
          {/* Outer Black Cloud / Extrusion Silhouette */}
          <path
            d="M 28 32 C 18 20, 42 10, 68 12 C 85 8, 115 10, 138 22 C 152 30, 155 45, 148 60 C 156 75, 142 94, 118 96 C 92 98, 65 102, 38 98 C 16 94, 10 76, 16 62 C 8 48, 14 36, 28 32 Z"
            fill="#09090b"
            stroke="#171717"
            strokeWidth="3"
          />

          {/* Dynamic Underline Swoosh Drop Shadow */}
          <path
            d="M 24 82 C 55 92, 108 90, 142 70 C 132 84, 85 96, 24 82 Z"
            fill="#000000"
          />
        </g>

        {/* Inner White Silhouette Contour */}
        <path
          d="M 32 35 C 24 25, 44 16, 68 18 C 84 14, 112 16, 133 26 C 145 34, 147 46, 140 58 C 147 70, 135 88, 114 90 C 90 92, 66 94, 40 91 C 22 87, 18 72, 22 60 C 16 48, 20 38, 32 35 Z"
          fill="#171717"
        />

        {/* Top Kicker Script: "the" */}
        <text
          x="34"
          y="28"
          fill="#38bdf8"
          fontFamily="'Brush Script MT', 'Plus Jakarta Sans', cursive, sans-serif"
          fontSize="14"
          fontStyle="italic"
          fontWeight="bold"
          letterSpacing="0.05em"
        >
          the
        </text>

        {/* Primary Hand-Lettered Word: "Tech" */}
        <text
          x="75"
          y="56"
          textAnchor="middle"
          fill="#ffffff"
          stroke="#0a0a0a"
          strokeWidth="3"
          paintOrder="stroke fill"
          fontFamily="'Cabinet Grotesk', 'Plus Jakarta Sans', Impact, sans-serif"
          fontSize="36"
          fontWeight="900"
          fontStyle="italic"
          letterSpacing="-0.04em"
        >
          Tech
        </text>

        {/* Secondary Word: "Starz" in script style */}
        <text
          x="72"
          y="84"
          textAnchor="middle"
          fill="#ffffff"
          stroke="#0a0a0a"
          strokeWidth="3.5"
          paintOrder="stroke fill"
          fontFamily="'Cabinet Grotesk', 'Plus Jakarta Sans', Impact, sans-serif"
          fontSize="30"
          fontWeight="900"
          letterSpacing="-0.02em"
        >
          Starz
        </text>

        {/* "101" Badge in bold street lettering */}
        <g transform="translate(112, 54) rotate(8)">
          <rect x="-2" y="-2" width="34" height="20" rx="4" fill="#0284c7" stroke="#ffffff" strokeWidth="1.5" />
          <text
            x="15"
            y="13"
            textAnchor="middle"
            fill="#ffffff"
            fontFamily="'JetBrains Mono', monospace"
            fontSize="12"
            fontWeight="900"
          >
            101
          </text>
        </g>

        {/* Dynamic Vector Swoosh Flourish */}
        <path
          d="M 28 80 Q 75 96 138 72"
          fill="none"
          stroke="#38bdf8"
          strokeWidth="3.5"
          strokeLinecap="round"
        />

        {/* Vector Star Sparkle Icon (top right) */}
        <path
          d="M 132 16 L 134 22 L 140 24 L 134 26 L 132 32 L 130 26 L 124 24 L 130 22 Z"
          fill="url(#starGradient)"
        />
        {/* Vector Star Sparkle Icon (bottom left) */}
        <path
          d="M 18 64 L 19 68 L 23 69 L 19 70 L 18 74 L 17 70 L 13 69 L 17 68 Z"
          fill="#38bdf8"
        />
      </svg>

      {/* Brand Text Lockup */}
      {showDomain && (
        <div className="flex flex-col justify-center">
          <div className="flex items-center text-lg font-black tracking-tight text-white leading-none">
            <span>techstarz</span>
            <span className="text-cyan-400">101</span>
            <span className="text-neutral-400 text-sm font-semibold">.com</span>
          </div>
          <span className="text-[10px] font-mono text-neutral-400 tracking-wider uppercase mt-0.5">
            Tech Blog &amp; Systems
          </span>
        </div>
      )}
    </div>
  );
};

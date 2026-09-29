import React from 'react';
import { AlertTriangle, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';

interface SeoScoreGaugeProps {
  score: number;
  rating: string;
  ratingColor: string;
  missingCount: number;
  passedCount: number;
  totalChecks: number;
  breakdown: {
    metadata: { score: number; max: number };
    content: { score: number; max: number };
    accessibility: { score: number; max: number };
    schema: { score: number; max: number };
  };
}

export const SeoScoreGauge: React.FC<SeoScoreGaugeProps> = ({
  score,
  rating,
  ratingColor,
  missingCount,
  passedCount,
  totalChecks,
  breakdown
}) => {
  // SVG Gauge calculations
  // Radius = 70, circumference = 2 * PI * 70 = ~439.8
  const radius = 68;
  const circumference = 2 * Math.PI * radius;
  // Use a 270 degree arc for gauge feel
  const arcLength = circumference * 0.75;
  const strokeDashoffset = arcLength - (arcLength * Math.min(100, Math.max(0, score))) / 100;

  // Determine stroke color
  const getStrokeGradient = () => {
    if (score >= 85) return 'url(#emeraldGradient)';
    if (score >= 65) return 'url(#cyanGradient)';
    if (score >= 50) return 'url(#amberGradient)';
    return 'url(#redGradient)';
  };

  return (
    <div className="bg-neutral-900/90 border border-neutral-800 rounded-xl p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
      {/* Left: The Circular Real-time Dial Gauge */}
      <div className="flex flex-col items-center shrink-0">
        <div className="relative w-48 h-44 flex items-center justify-center">
          <svg className="w-full h-full -rotate-135 overflow-visible" viewBox="0 0 180 180">
            <defs>
              <linearGradient id="emeraldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
              <linearGradient id="cyanGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#38bdf8" />
              </linearGradient>
              <linearGradient id="amberGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#d97706" />
              </linearGradient>
              <linearGradient id="redGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ef4444" />
                <stop offset="100%" stopColor="#dc2626" />
              </linearGradient>
            </defs>

            {/* Background Track Arc */}
            <circle
              cx="90"
              cy="90"
              r={radius}
              fill="transparent"
              stroke="#262626"
              strokeWidth="12"
              strokeDasharray={`${arcLength} ${circumference}`}
              strokeLinecap="round"
            />

            {/* Animated Dynamic Score Arc */}
            <circle
              cx="90"
              cy="90"
              r={radius}
              fill="transparent"
              stroke={getStrokeGradient()}
              strokeWidth="12"
              strokeDasharray={`${arcLength} ${circumference}`}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-700 ease-out"
            />
          </svg>

          {/* Center Score Reading */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pt-2">
            <span className="text-4xl font-black font-mono tracking-tight text-white tabular-nums">
              {score}
              <span className="text-lg font-normal text-neutral-400 font-sans">%</span>
            </span>
            <span className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider mt-0.5">
              SEO Score
            </span>
          </div>
        </div>

        {/* Rating Badge */}
        <div className="flex items-center gap-1.5 mt-[-10px]">
          <span className={`text-xs font-bold px-2.5 py-1 rounded-md bg-neutral-950 border border-neutral-800 font-mono ${ratingColor}`}>
            {rating}
          </span>
        </div>
      </div>

      {/* Middle: Progress Summary & Missing Requirements Status */}
      <div className="flex-1 space-y-4 text-xs w-full">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-semibold text-white text-sm">
              Optimization Health Checklist
            </span>
            <span className="font-mono text-neutral-300">
              {passedCount} / {totalChecks} checks passing
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2 rounded-full bg-neutral-950 border border-neutral-800 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                score >= 85 ? 'bg-emerald-400' : score >= 65 ? 'bg-cyan-400' : 'bg-amber-400'
              }`}
              style={{ width: `${(passedCount / totalChecks) * 100}%` }}
            />
          </div>
        </div>

        {/* Missing Requirements Alert Box */}
        {missingCount > 0 ? (
          <div className="p-3.5 rounded-lg bg-amber-950/20 border border-amber-800/40 flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold text-amber-300 block">
                {missingCount} requirement{missingCount > 1 ? 's' : ''} require attention
              </span>
              <p className="text-[11px] text-neutral-300 mt-0.5 leading-relaxed">
                Review the checklist below to address missing alt text, keyword density, or meta description limits before scraping or publishing.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-3.5 rounded-lg bg-emerald-950/20 border border-emerald-800/40 flex items-start gap-3">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold text-emerald-300 block">
                All 12 requirements verified
              </span>
              <p className="text-[11px] text-neutral-300 mt-0.5 leading-relaxed">
                Clean meta tags, alt text, optimal keyword density, Schema.org BlogPosting, and author profile configured.
              </p>
            </div>
          </div>
        )}

        {/* Sub-Category Mini Meters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-[11px]">
          <div className="p-2 rounded bg-neutral-950 border border-neutral-850">
            <div className="text-neutral-400 truncate">Metadata</div>
            <div className="text-white font-bold mt-0.5">
              {breakdown.metadata.score}/{breakdown.metadata.max}
            </div>
          </div>
          <div className="p-2 rounded bg-neutral-950 border border-neutral-850">
            <div className="text-neutral-400 truncate">Content &amp; KW</div>
            <div className="text-white font-bold mt-0.5">
              {breakdown.content.score}/{breakdown.content.max}
            </div>
          </div>
          <div className="p-2 rounded bg-neutral-950 border border-neutral-850">
            <div className="text-neutral-400 truncate">Alt &amp; Media</div>
            <div className="text-white font-bold mt-0.5">
              {breakdown.accessibility.score}/{breakdown.accessibility.max}
            </div>
          </div>
          <div className="p-2 rounded bg-neutral-950 border border-neutral-850">
            <div className="text-neutral-400 truncate">Schema / E-E-A-T</div>
            <div className="text-white font-bold mt-0.5">
              {breakdown.schema.score}/{breakdown.schema.max}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

"use client";

import { motion } from "framer-motion";
import { getRiskColor, getRiskLabel } from "@/lib/utils";
import { RiskLevel } from "@/types";

interface RiskScoreGaugeProps {
  score: number;
  level: RiskLevel;
  size?: "sm" | "md" | "lg";
}

const SIZE_MAP = {
  sm: { r: 40, stroke: 6, dim: 96, fontSize: "text-xl", labelSize: "text-xs" },
  md: { r: 56, stroke: 8, dim: 128, fontSize: "text-3xl", labelSize: "text-sm" },
  lg: { r: 72, stroke: 10, dim: 164, fontSize: "text-4xl", labelSize: "text-base" },
};

export function RiskScoreGauge({ score, level, size = "md" }: RiskScoreGaugeProps) {
  const { r, stroke, dim, fontSize, labelSize } = SIZE_MAP[size];
  const circumference = 2 * Math.PI * r;
  const progressLength = (score / 100) * circumference;

  const colorMap: Record<RiskLevel, string> = {
    low: "#10b981",
    medium: "#f59e0b",
    high: "#f97316",
    critical: "#ef4444",
  };
  const color = colorMap[level] || "#10b981";

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: dim, height: dim }}>
        <svg
          width={dim}
          height={dim}
          viewBox={`0 0 ${dim} ${dim}`}
          className="rotate-[-90deg]"
        >
          {/* Background ring */}
          <circle
            cx={dim / 2}
            cy={dim / 2}
            r={r}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={stroke}
          />
          {/* Glow filter */}
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {/* Progress ring */}
          <motion.circle
            cx={dim / 2}
            cy={dim / 2}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference - progressLength }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
            filter="url(#glow)"
          />
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className={`${fontSize} font-bold text-white font-mono`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {Math.round(score)}
          </motion.span>
          <span className={`${labelSize} text-slate-400 -mt-1`}>/100</span>
        </div>
      </div>

      <div className="text-center">
        <p className={`font-semibold ${getRiskColor(level)}`}>{getRiskLabel(level)}</p>
        <p className="text-xs text-slate-500 mt-0.5">Risk Score</p>
      </div>
    </div>
  );
}

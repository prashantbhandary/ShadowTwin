"use client";

import { cn, getRiskColor, getRiskBgColor, getRiskLabel } from "@/lib/utils";
import { RiskLevel } from "@/types";
import { Shield, ShieldAlert, ShieldCheck, ShieldX } from "lucide-react";

const ICONS = {
  low: ShieldCheck,
  medium: Shield,
  high: ShieldAlert,
  critical: ShieldX,
};

interface RiskBadgeProps {
  level: RiskLevel;
  score?: number;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  showScore?: boolean;
  className?: string;
}

export function RiskBadge({ level, score, size = "md", showIcon = true, showScore = false, className }: RiskBadgeProps) {
  const Icon = ICONS[level] || Shield;

  const sizeStyles = {
    sm: "text-xs px-2 py-0.5 gap-1",
    md: "text-sm px-2.5 py-1 gap-1.5",
    lg: "text-base px-3 py-1.5 gap-2",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-medium",
        sizeStyles[size],
        getRiskBgColor(level),
        getRiskColor(level),
        className
      )}
    >
      {showIcon && <Icon className={size === "lg" ? "w-4 h-4" : "w-3.5 h-3.5"} />}
      <span>{getRiskLabel(level)}</span>
      {showScore && score !== undefined && (
        <span className="font-mono ml-0.5">({Math.round(score)})</span>
      )}
    </span>
  );
}

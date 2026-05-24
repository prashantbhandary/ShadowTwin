"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: { value: number; label: string };
  variant?: "default" | "danger" | "warning" | "success" | "purple";
  delay?: number;
  className?: string;
}

const VARIANT_STYLES = {
  default: {
    icon: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20",
    glow: "hover:shadow-[0_0_30px_rgba(0,245,255,0.08)]",
    value: "text-cyan-400",
  },
  danger: {
    icon: "text-red-400 bg-red-400/10 border-red-400/20",
    glow: "hover:shadow-[0_0_30px_rgba(239,68,68,0.1)]",
    value: "text-red-400",
  },
  warning: {
    icon: "text-amber-400 bg-amber-400/10 border-amber-400/20",
    glow: "hover:shadow-[0_0_30px_rgba(245,158,11,0.1)]",
    value: "text-amber-400",
  },
  success: {
    icon: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
    glow: "hover:shadow-[0_0_30px_rgba(16,185,129,0.1)]",
    value: "text-emerald-400",
  },
  purple: {
    icon: "text-purple-400 bg-purple-400/10 border-purple-400/20",
    glow: "hover:shadow-[0_0_30px_rgba(168,85,247,0.1)]",
    value: "text-purple-400",
  },
};

export function StatCard({
  title, value, subtitle, icon: Icon, trend, variant = "default", delay = 0, className,
}: StatCardProps) {
  const styles = VARIANT_STYLES[variant];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={cn(
        "relative rounded-xl border border-white/[0.06] bg-white/[0.03] p-6 transition-all duration-300 backdrop-blur-sm",
        styles.glow,
        className
      )}
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />

      <div className="relative">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-slate-400 font-medium">{title}</p>
            <motion.p
              className={cn("text-3xl font-bold mt-2 font-mono", styles.value)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: delay + 0.2 }}
            >
              {value}
            </motion.p>
            {subtitle && (
              <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
            )}
          </div>
          <div className={cn("w-11 h-11 rounded-xl border flex items-center justify-center flex-shrink-0", styles.icon)}>
            <Icon className="w-5 h-5" />
          </div>
        </div>

        {trend && (
          <div className="mt-4 flex items-center gap-1.5">
            <span className={cn(
              "text-xs font-medium",
              trend.value > 0 ? "text-red-400" : "text-emerald-400"
            )}>
              {trend.value > 0 ? "+" : ""}{trend.value}%
            </span>
            <span className="text-xs text-slate-500">{trend.label}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

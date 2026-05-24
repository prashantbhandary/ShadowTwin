import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { RiskLevel } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getRiskColor(level: RiskLevel | string): string {
  const map: Record<string, string> = {
    low: "text-emerald-400",
    medium: "text-amber-400",
    high: "text-orange-400",
    critical: "text-red-400",
  };
  return map[level] || "text-slate-400";
}

export function getRiskBgColor(level: RiskLevel | string): string {
  const map: Record<string, string> = {
    low: "bg-emerald-400/10 border-emerald-400/30",
    medium: "bg-amber-400/10 border-amber-400/30",
    high: "bg-orange-400/10 border-orange-400/30",
    critical: "bg-red-400/10 border-red-400/30",
  };
  return map[level] || "bg-slate-400/10 border-slate-400/30";
}

export function getRiskGlow(level: RiskLevel | string): string {
  const map: Record<string, string> = {
    low: "shadow-[0_0_20px_rgba(16,185,129,0.2)]",
    medium: "shadow-[0_0_20px_rgba(245,158,11,0.2)]",
    high: "shadow-[0_0_20px_rgba(249,115,22,0.2)]",
    critical: "shadow-[0_0_20px_rgba(239,68,68,0.3)]",
  };
  return map[level] || "";
}

export function getRiskHex(level: RiskLevel | string): string {
  const map: Record<string, string> = {
    low: "#10b981",
    medium: "#f59e0b",
    high: "#f97316",
    critical: "#ef4444",
  };
  return map[level] || "#6b7280";
}

export function formatRiskScore(score: number): string {
  return Math.round(score).toString();
}

export function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getAlertSeverityColor(severity: string): string {
  const map: Record<string, string> = {
    info: "text-blue-400",
    low: "text-emerald-400",
    medium: "text-amber-400",
    high: "text-orange-400",
    critical: "text-red-400",
  };
  return map[severity] || "text-slate-400";
}

export function getAlertTypeIcon(type: string): string {
  const map: Record<string, string> = {
    fake_profile: "User",
    image_copy: "Image",
    email_leak: "Mail",
    deepfake: "Scan",
    osint_hit: "Globe",
    risk_increase: "TrendingUp",
    username_squatting: "AtSign",
  };
  return map[type] || "AlertTriangle";
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}

export function getRiskLabel(level: RiskLevel | string): string {
  const map: Record<string, string> = {
    low: "Protected",
    medium: "At Risk",
    high: "High Risk",
    critical: "Critical",
  };
  return map[level] || "Unknown";
}

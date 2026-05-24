"use client";

import { motion } from "framer-motion";
import { AlertTriangle, User, Image, Mail, Scan, Globe, TrendingUp, AtSign, CheckCircle, X } from "lucide-react";
import { Alert } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatRelativeTime, getAlertSeverityColor } from "@/lib/utils";
import { useMarkAlertRead } from "@/hooks/useAlerts";
import { cn } from "@/lib/utils";

const TYPE_ICONS: Record<string, any> = {
  fake_profile: User,
  image_copy: Image,
  email_leak: Mail,
  deepfake: Scan,
  osint_hit: Globe,
  risk_increase: TrendingUp,
  username_squatting: AtSign,
};

const SEVERITY_BADGE: Record<string, any> = {
  info: "info",
  low: "low",
  medium: "medium",
  high: "high",
  critical: "critical",
};

interface AlertCardProps {
  alert: Alert;
  compact?: boolean;
  index?: number;
}

export function AlertCard({ alert, compact = false, index = 0 }: AlertCardProps) {
  const Icon = TYPE_ICONS[alert.alert_type] || AlertTriangle;
  const { mutate: markRead } = useMarkAlertRead();

  const borderColor: Record<string, string> = {
    critical: "border-l-red-400",
    high: "border-l-orange-400",
    medium: "border-l-amber-400",
    low: "border-l-emerald-400",
    info: "border-l-blue-400",
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={cn(
        "relative rounded-xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm",
        "border-l-2",
        borderColor[alert.severity] || "border-l-slate-400",
        !alert.is_read && "bg-white/[0.04]",
        compact ? "p-3" : "p-4"
      )}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={cn(
          "flex-shrink-0 w-9 h-9 rounded-lg border flex items-center justify-center",
          `${getAlertSeverityColor(alert.severity)} bg-current/5`
        )} style={{ backgroundColor: undefined }}>
          <Icon className={cn("w-4 h-4", getAlertSeverityColor(alert.severity))} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className={cn("text-sm font-medium", !alert.is_read ? "text-white" : "text-slate-300")}>
                  {alert.title}
                </p>
                {!alert.is_read && (
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 flex-shrink-0" />
                )}
              </div>

              {!compact && alert.description && (
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">{alert.description}</p>
              )}

              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <Badge variant={SEVERITY_BADGE[alert.severity] as any}>
                  {alert.severity.toUpperCase()}
                </Badge>
                <span className="text-xs text-slate-500">
                  {formatRelativeTime(alert.created_at)}
                </span>
                {alert.threat_score > 0 && (
                  <span className="text-xs text-slate-500">
                    Threat: <span className="font-mono">{Math.round(alert.threat_score)}%</span>
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 flex-shrink-0">
              {!alert.is_read && (
                <Button
                  size="icon"
                  variant="ghost"
                  className="w-7 h-7"
                  onClick={() => markRead(alert.id)}
                  title="Mark as read"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>
          </div>

          {!compact && alert.evidence_url && (
            <a
              href={alert.evidence_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-2 text-xs text-cyan-400 hover:text-cyan-300 underline truncate max-w-full"
            >
              View Evidence →
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}

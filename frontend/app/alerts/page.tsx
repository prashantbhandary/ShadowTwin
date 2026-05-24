"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Bell, Filter, CheckCheck, RefreshCw, Shield } from "lucide-react";
import { AlertCard } from "@/components/alerts/AlertCard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAlerts, useAlertStats, useMarkAllAlertsRead } from "@/hooks/useAlerts";
import { AlertSeverity, AlertType } from "@/types";
import { cn } from "@/lib/utils";

const SEVERITY_FILTERS: { value: AlertSeverity | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "critical", label: "Critical" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

export default function AlertsPage() {
  const [severity, setSeverity] = useState<AlertSeverity | "all">("all");
  const [unreadOnly, setUnreadOnly] = useState(false);

  const { data: alerts, isLoading, refetch } = useAlerts({
    limit: 50,
    unread_only: unreadOnly,
  });
  const { data: stats } = useAlertStats();
  const { mutate: markAllRead, isPending: markingAll } = useMarkAllAlertsRead();

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-white">
            Alerts <span className="neon-text">Center</span>
          </h1>
          <p className="text-slate-400 mt-1 text-sm">
            {stats?.unread ?? 0} unread alerts · {stats?.total ?? 0} total
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-1.5">
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </Button>
          <Button
            variant="cyber"
            size="sm"
            onClick={() => markAllRead()}
            loading={markingAll}
            disabled={!stats?.unread}
            className="gap-1.5"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Mark All Read
          </Button>
        </div>
      </motion.div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Critical", count: stats?.critical ?? 0, color: "text-red-400", bg: "bg-red-400/10 border-red-400/20" },
          { label: "High", count: stats?.high ?? 0, color: "text-orange-400", bg: "bg-orange-400/10 border-orange-400/20" },
          { label: "Medium", count: stats?.medium ?? 0, color: "text-amber-400", bg: "bg-amber-400/10 border-amber-400/20" },
          { label: "Unread", count: stats?.unread ?? 0, color: "text-cyan-400", bg: "bg-cyan-400/10 border-cyan-400/20" },
        ].map(({ label, count, color, bg }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={cn("p-4 rounded-xl border", bg)}
          >
            <p className={cn("text-2xl font-bold font-mono", color)}>{count}</p>
            <p className="text-sm text-slate-400 mt-0.5">{label}</p>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex gap-1">
          {SEVERITY_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setSeverity(f.value)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                severity === f.value
                  ? "bg-cyan-400/10 border-cyan-400/30 text-cyan-400"
                  : "bg-white/[0.02] border-white/[0.06] text-slate-400 hover:text-white"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => setUnreadOnly(!unreadOnly)}
          className={cn(
            "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
            unreadOnly
              ? "bg-purple-400/10 border-purple-400/30 text-purple-400"
              : "bg-white/[0.02] border-white/[0.06] text-slate-400 hover:text-white"
          )}
        >
          Unread Only
        </button>
      </div>

      {/* Alert list */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Security Events</CardTitle>
            <Badge variant="ghost">{alerts?.length ?? 0} events</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-xl" />
              ))}
            </div>
          ) : !alerts?.length ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-full bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-emerald-400" />
              </div>
              <p className="text-white font-semibold text-lg">No alerts found</p>
              <p className="text-slate-400 text-sm mt-1">
                {unreadOnly || severity !== "all"
                  ? "Try adjusting your filters"
                  : "Your identity is currently protected"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.map((alert, i) => (
                <AlertCard key={alert.id} alert={alert} index={i} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { motion } from "framer-motion";
import {
  Shield, AlertTriangle, Eye, Mail, Scan, Users,
  Activity, TrendingUp, Clock, Zap
} from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { RiskScoreGauge } from "@/components/dashboard/RiskScoreGauge";
import { ThreatChart } from "@/components/dashboard/ThreatChart";
import { AlertCard } from "@/components/alerts/AlertCard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAlerts, useAlertStats } from "@/hooks/useAlerts";
import { useAuthStore } from "@/store/auth.store";
import { useIdentityProfiles } from "@/hooks/useIdentity";
import { formatRelativeTime } from "@/lib/utils";
import Link from "next/link";

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { data: alertStats, isLoading: statsLoading } = useAlertStats();
  const { data: alerts, isLoading: alertsLoading } = useAlerts({ limit: 5 });
  const { data: profiles } = useIdentityProfiles();

  const primaryProfile = profiles?.find((p) => p.is_primary) || profiles?.[0];
  const riskScore = primaryProfile?.risk_score ?? 0;
  const riskLevel = primaryProfile?.risk_level ?? "low";
  const activeThreatCount = (alertStats?.critical ?? 0) + (alertStats?.high ?? 0);

  return (
    <div className="space-y-8">
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-white">
            Welcome back, <span className="neon-text">{user?.full_name?.split(" ")[0] || user?.username}</span>
          </h1>
          <p className="text-slate-400 mt-1 text-sm">
            Your digital identity shield is monitoring <span className="text-cyan-400">{profiles?.length ?? 0}</span> profile{profiles?.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/investigation">
            <Button variant="cyber" className="gap-2">
              <Scan className="w-4 h-4" />
              Run Scan
            </Button>
          </Link>
          <Link href="/alerts">
            <Button variant="outline" className="gap-2">
              <Bell className="w-4 h-4" />
              Alerts
              {(alertStats?.unread ?? 0) > 0 && (
                <Badge variant="critical" className="ml-1 text-[10px] px-1.5 py-0">{alertStats?.unread}</Badge>
              )}
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Top row: risk gauge + stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Risk Score Gauge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="lg:col-span-1"
        >
          <Card glow="cyan" className="p-6 flex flex-col items-center">
            <p className="text-xs text-slate-400 uppercase tracking-widest mb-4">Identity Risk</p>
            <RiskScoreGauge score={riskScore} level={riskLevel} size="lg" />
            <div className="w-full mt-4 pt-4 border-t border-white/[0.06]">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Last scan</span>
                <span className="text-slate-300">
                  {primaryProfile?.last_scan_at
                    ? formatRelativeTime(primaryProfile.last_scan_at)
                    : "Never"}
                </span>
              </div>
              <Link href="/investigation">
                <Button variant="cyber" size="sm" className="w-full mt-3">
                  <Zap className="w-3.5 h-3.5 mr-1" />
                  Scan Now
                </Button>
              </Link>
            </div>
          </Card>
        </motion.div>

        {/* Stats grid */}
        <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-3 gap-4">
          {statsLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))
          ) : (
            <>
              <StatCard
                title="Active Threats"
                value={activeThreatCount}
                subtitle="Critical + High severity"
                icon={AlertTriangle}
                variant="danger"
                delay={0.1}
              />
              <StatCard
                title="Unread Alerts"
                value={alertStats?.unread ?? 0}
                subtitle="Require attention"
                icon={Activity}
                variant="warning"
                delay={0.15}
              />
              <StatCard
                title="Profiles Found"
                value={profiles?.length ?? 0}
                subtitle="Identity profiles"
                icon={Users}
                variant="purple"
                delay={0.2}
              />
              <StatCard
                title="Total Alerts"
                value={alertStats?.total ?? 0}
                subtitle="All time"
                icon={Eye}
                variant="default"
                delay={0.25}
              />
              <StatCard
                title="Critical Alerts"
                value={alertStats?.critical ?? 0}
                subtitle="Immediate action needed"
                icon={Shield}
                variant="danger"
                delay={0.3}
              />
              <StatCard
                title="Medium Alerts"
                value={alertStats?.medium ?? 0}
                subtitle="Monitor closely"
                icon={TrendingUp}
                variant="warning"
                delay={0.35}
              />
            </>
          )}
        </div>
      </div>

      {/* Charts + Alerts row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Threat timeline chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="lg:col-span-3"
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Threat Timeline</CardTitle>
                  <CardDescription>Scans and threats detected over the past 7 days</CardDescription>
                </div>
                <Badge variant="default">Live</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <ThreatChart type="area" />
              <div className="flex gap-4 mt-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-0.5 bg-cyan-400 rounded" />
                  <span className="text-xs text-slate-400">Scans</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-0.5 bg-red-400 rounded" />
                  <span className="text-xs text-slate-400">Threats</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Alert distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader>
              <CardTitle>Alert Distribution</CardTitle>
              <CardDescription>Breakdown by severity</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: "Critical", count: alertStats?.critical ?? 0, color: "bg-red-400", textColor: "text-red-400" },
                { label: "High", count: alertStats?.high ?? 0, color: "bg-orange-400", textColor: "text-orange-400" },
                { label: "Medium", count: alertStats?.medium ?? 0, color: "bg-amber-400", textColor: "text-amber-400" },
                { label: "Low", count: alertStats?.low ?? 0, color: "bg-emerald-400", textColor: "text-emerald-400" },
              ].map(({ label, count, color, textColor }) => {
                const total = alertStats?.total || 1;
                const pct = Math.round((count / total) * 100);

                return (
                  <div key={label}>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-slate-400">{label}</span>
                      <span className={`text-xs font-mono font-medium ${textColor}`}>{count}</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full ${color} rounded-full`}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                      />
                    </div>
                  </div>
                );
              })}

              <div className="pt-2 border-t border-white/[0.06]">
                <ThreatChart type="bar" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent alerts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Alerts</CardTitle>
                <CardDescription>Latest security events requiring attention</CardDescription>
              </div>
              <Link href="/alerts">
                <Button variant="ghost" size="sm" className="text-cyan-400">
                  View All →
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {alertsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 rounded-xl" />
                ))}
              </div>
            ) : !alerts?.length ? (
              <div className="text-center py-12">
                <div className="w-14 h-14 rounded-full bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center mx-auto mb-3">
                  <Shield className="w-7 h-7 text-emerald-400" />
                </div>
                <p className="text-white font-medium">No threats detected</p>
                <p className="text-sm text-slate-400 mt-1">Your identity is currently protected</p>
                <Link href="/investigation">
                  <Button variant="cyber" size="sm" className="mt-4">
                    Run a Scan
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {alerts.map((alert, i) => (
                  <AlertCard key={alert.id} alert={alert} compact index={i} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Identity profiles summary */}
      {profiles && profiles.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Protected Identities</CardTitle>
                  <CardDescription>Identity profiles being monitored</CardDescription>
                </div>
                <Link href="/settings">
                  <Button variant="outline" size="sm">+ Add Profile</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {profiles.map((profile, i) => (
                  <motion.div
                    key={profile.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-4 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center text-cyan-400 font-bold text-sm">
                        {(profile.full_name || profile.email || "?")[0].toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white truncate">{profile.full_name || "Unnamed Profile"}</p>
                        <p className="text-xs text-slate-400 truncate">{profile.email || "No email"}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/[0.06]">
                      <span className="text-xs text-slate-400">Risk Score</span>
                      <span className={`text-xs font-mono font-bold ${
                        profile.risk_level === "low" ? "text-emerald-400" :
                        profile.risk_level === "medium" ? "text-amber-400" :
                        profile.risk_level === "high" ? "text-orange-400" : "text-red-400"
                      }`}>
                        {Math.round(profile.risk_score)}/100
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}

function Bell({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  );
}

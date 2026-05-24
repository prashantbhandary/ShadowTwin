"use client";

import { Bell, Search, Shield } from "lucide-react";
import Link from "next/link";
import { useAlertStats } from "@/hooks/useAlerts";
import { useAuthStore } from "@/store/auth.store";

export function Topbar() {
  const { user } = useAuthStore();
  const { data: stats } = useAlertStats();

  return (
    <header className="h-16 border-b border-white/[0.06] bg-[#020818]/80 backdrop-blur-xl px-6 flex items-center justify-between flex-shrink-0">
      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          placeholder="Search threats, profiles..."
          className="w-64 h-9 bg-white/[0.04] border border-white/10 rounded-lg pl-9 pr-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400/40 focus:ring-1 focus:ring-cyan-400/20 transition-all"
        />
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Alert bell */}
        <Link href="/alerts">
          <button className="relative w-9 h-9 flex items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-slate-400 hover:text-cyan-400 hover:border-cyan-400/30 transition-all">
            <Bell className="w-4 h-4" />
            {(stats?.unread || 0) > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center">
                {(stats?.unread || 0) > 9 ? "9+" : stats?.unread}
              </span>
            )}
          </button>
        </Link>

        {/* Security status */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-emerald-400/20 bg-emerald-400/5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-emerald-400 font-medium hidden sm:block">Protected</span>
        </div>

        {/* User avatar */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full border border-cyan-400/30 bg-cyan-400/10 flex items-center justify-center">
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt="Avatar" className="w-full h-full rounded-full object-cover" />
            ) : (
              <Shield className="w-4 h-4 text-cyan-400" />
            )}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-white leading-none">{user?.full_name || user?.username}</p>
            <p className="text-xs text-slate-500 mt-0.5 capitalize">{user?.role}</p>
          </div>
        </div>
      </div>
    </header>
  );
}

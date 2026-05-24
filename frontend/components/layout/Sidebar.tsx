"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Search, Bell, Settings, Shield, LogOut,
  ChevronLeft, ChevronRight, User, Zap, Eye
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app.store";
import { useLogout } from "@/hooks/useAuth";
import { useAlertStats } from "@/hooks/useAlerts";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard", color: "text-cyan-400" },
  { href: "/investigation", icon: Search, label: "Investigation", color: "text-purple-400" },
  { href: "/alerts", icon: Bell, label: "Alerts", color: "text-orange-400", badge: true },
  { href: "/settings", icon: Settings, label: "Settings", color: "text-slate-400" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar } = useAppStore();
  const { mutate: logout } = useLogout();
  const { data: alertStats } = useAlertStats();

  return (
    <motion.aside
      animate={{ width: sidebarOpen ? 240 : 72 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="relative flex flex-col h-screen bg-[#050f2e]/80 border-r border-white/[0.06] backdrop-blur-xl z-50 flex-shrink-0"
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-lg bg-cyan-400/10 border border-cyan-400/30 flex items-center justify-center flex-shrink-0">
            <Shield className="w-5 h-5 text-cyan-400" />
          </div>
          <AnimatePresence>
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                <div className="text-white font-bold text-base tracking-tight">Shadow</div>
                <div className="text-cyan-400 font-bold text-base tracking-tight -mt-1">Twin</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-hidden">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const unread = item.badge ? alertStats?.unread || 0 : 0;

          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "relative flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-200 group cursor-pointer",
                  isActive
                    ? "bg-cyan-400/10 border border-cyan-400/20"
                    : "hover:bg-white/5 border border-transparent"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-cyan-400 rounded-full"
                  />
                )}
                <div className={cn("flex-shrink-0 relative", isActive ? item.color : "text-slate-400 group-hover:text-slate-300")}>
                  <item.icon className="w-5 h-5" />
                  {unread > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center">
                      {unread > 9 ? "9+" : unread}
                    </span>
                  )}
                </div>
                <AnimatePresence>
                  {sidebarOpen && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className={cn(
                        "text-sm font-medium whitespace-nowrap",
                        isActive ? "text-white" : "text-slate-400 group-hover:text-slate-300"
                      )}
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Status indicator */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mx-3 mb-3 p-3 rounded-lg bg-emerald-400/5 border border-emerald-400/20"
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-emerald-400 font-medium">AI Shield Active</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">Monitoring your identity</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Logout */}
      <div className="p-3 border-t border-white/[0.06]">
        <button
          onClick={() => logout()}
          className={cn(
            "flex items-center gap-3 w-full rounded-lg px-3 py-2.5 text-slate-400 hover:text-red-400 hover:bg-red-400/5 transition-all duration-200 border border-transparent hover:border-red-400/20",
          )}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          <AnimatePresence>
            {sidebarOpen && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-sm font-medium"
              >
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-20 w-6 h-6 bg-[#050f2e] border border-white/10 rounded-full flex items-center justify-center text-slate-400 hover:text-cyan-400 hover:border-cyan-400/30 transition-all z-10"
      >
        {sidebarOpen ? <ChevronLeft className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
      </button>
    </motion.aside>
  );
}

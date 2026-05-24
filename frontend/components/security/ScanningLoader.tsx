"use client";

import { motion } from "framer-motion";
import { Shield } from "lucide-react";

interface ScanningLoaderProps {
  message?: string;
  subMessage?: string;
}

export function ScanningLoader({
  message = "Scanning...",
  subMessage = "Analyzing digital identity threats",
}: ScanningLoaderProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-6">
      {/* Radar animation */}
      <div className="relative w-24 h-24">
        {/* Outer rings */}
        {[1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className="absolute inset-0 rounded-full border border-cyan-400/20"
            initial={{ scale: 1, opacity: 0.8 }}
            animate={{ scale: 1 + i * 0.4, opacity: 0 }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.4, ease: "easeOut" }}
          />
        ))}

        {/* Main circle */}
        <div className="absolute inset-0 rounded-full border-2 border-cyan-400/30 bg-cyan-400/5 flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute inset-1 rounded-full border-t-2 border-cyan-400 border-r-transparent border-b-transparent border-l-transparent"
          />
          <Shield className="w-8 h-8 text-cyan-400" />
        </div>

        {/* Scan line */}
        <motion.div
          className="absolute top-1/2 left-1/2 w-1/2 h-0.5 bg-gradient-to-r from-cyan-400 to-transparent origin-left"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: "0 50%" }}
        />
      </div>

      {/* Messages */}
      <div className="text-center space-y-1">
        <motion.p
          className="text-white font-medium"
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {message}
        </motion.p>
        <p className="text-sm text-slate-400">{subMessage}</p>
      </div>

      {/* Progress dots */}
      <div className="flex gap-1.5">
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-cyan-400"
            animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.2, 0.8] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </div>
    </div>
  );
}

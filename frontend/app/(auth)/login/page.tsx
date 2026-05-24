"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, Mail, Lock, Eye, EyeOff, ArrowRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLogin } from "@/hooks/useAuth";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const { mutate: login, isPending } = useLogin();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    login(
      { email, password },
      {
        onError: (err: any) => {
          setError(err?.response?.data?.detail || "Invalid credentials. Please try again.");
        },
      }
    );
  };

  return (
    <div className="min-h-screen flex cyber-bg relative overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-cyan-400/30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 3 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Left panel — branding */}
      <div className="hidden lg:flex flex-1 flex-col justify-center px-16 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/5 to-purple-400/5" />
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="relative max-w-md"
        >
          {/* Logo */}
          <div className="flex items-center gap-3 mb-10">
            <div className="w-12 h-12 rounded-xl bg-cyan-400/10 border border-cyan-400/30 flex items-center justify-center">
              <Shield className="w-7 h-7 text-cyan-400" />
            </div>
            <div>
              <span className="text-white font-bold text-2xl">Shadow</span>
              <span className="text-cyan-400 font-bold text-2xl">Twin</span>
            </div>
          </div>

          <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
            Your digital identity
            <span className="block gradient-text">deserves protection</span>
          </h1>
          <p className="text-slate-400 text-lg mb-8">
            AI-powered defense against identity theft, deepfakes, and online impersonation.
          </p>

          {/* Feature pills */}
          <div className="space-y-3">
            {[
              { icon: "🛡️", text: "Real-time identity monitoring" },
              { icon: "🤖", text: "AI face similarity detection" },
              { icon: "🌐", text: "OSINT platform scanning" },
              { icon: "🔑", text: "Dark web email breach alerts" },
            ].map(({ icon, text }) => (
              <motion.div
                key={text}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="flex items-center gap-3 text-slate-300"
              >
                <span className="text-xl">{icon}</span>
                <span>{text}</span>
              </motion.div>
            ))}
          </div>

          {/* Decorative element */}
          <motion.div
            className="absolute -right-20 top-1/2 -translate-y-1/2 w-64 h-64 rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(0,245,255,0.08) 0%, transparent 70%)",
            }}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
        </motion.div>
      </div>

      {/* Right panel — login form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <Shield className="w-7 h-7 text-cyan-400" />
            <span className="text-white font-bold text-xl">Shadow<span className="text-cyan-400">Twin</span></span>
          </div>

          {/* Card */}
          <div className="glass-card rounded-2xl p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white">Welcome back</h2>
              <p className="text-slate-400 mt-1 text-sm">Sign in to your identity shield</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<Mail className="w-4 h-4" />}
                required
              />

              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  icon={<Lock className="w-4 h-4" />}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-8 text-slate-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2"
                >
                  {error}
                </motion.p>
              )}

              <Button
                type="submit"
                loading={isPending}
                size="lg"
                className="w-full gap-2 mt-2"
              >
                Sign In
                <ArrowRight className="w-4 h-4" />
              </Button>
            </form>

            {/* Demo credentials */}
            <div className="mt-4 p-3 rounded-lg bg-cyan-400/5 border border-cyan-400/20">
              <p className="text-xs text-cyan-400 font-medium mb-1">
                <Zap className="w-3 h-3 inline mr-1" />
                Demo Mode
              </p>
              <p className="text-xs text-slate-400">
                Register a new account to explore all features with mock AI data.
              </p>
            </div>

            <div className="mt-6 text-center">
              <p className="text-slate-400 text-sm">
                Don't have an account?{" "}
                <Link href="/signup" className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors">
                  Create one →
                </Link>
              </p>
            </div>
          </div>

          <p className="text-center text-xs text-slate-500 mt-6">
            Protected by ShadowTwin AI Security Platform
          </p>
        </motion.div>
      </div>
    </div>
  );
}

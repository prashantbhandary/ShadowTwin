"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, Mail, Lock, User, Eye, EyeOff, ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRegister } from "@/hooks/useAuth";
import Link from "next/link";

const FEATURES = [
  "AI-powered identity theft detection",
  "Real-time dark web monitoring",
  "Face similarity analysis",
  "OSINT platform scanning",
  "Deepfake detection",
  "Instant security alerts",
];

export default function SignupPage() {
  const [form, setForm] = useState({ email: "", username: "", full_name: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const { mutate: register, isPending } = useRegister();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    register(form, {
      onError: (err: any) => {
        setError(err?.response?.data?.detail || "Registration failed. Please try again.");
      },
    });
  };

  return (
    <div className="min-h-screen flex cyber-bg relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute -top-40 -left-40 w-80 h-80 rounded-full opacity-10"
        style={{ background: "radial-gradient(circle, #00f5ff, transparent)" }}
      />
      <div className="absolute -bottom-40 -right-40 w-80 h-80 rounded-full opacity-10"
        style={{ background: "radial-gradient(circle, #a855f7, transparent)" }}
      />

      {/* Left — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <div className="flex items-center gap-2 mb-8">
            <Shield className="w-7 h-7 text-cyan-400" />
            <span className="text-white font-bold text-xl">Shadow<span className="text-cyan-400">Twin</span></span>
          </div>

          <div className="glass-card rounded-2xl p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white">Create your shield</h2>
              <p className="text-slate-400 mt-1 text-sm">Start protecting your digital identity today</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Full Name"
                placeholder="John Doe"
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                icon={<User className="w-4 h-4" />}
              />
              <Input
                label="Username"
                placeholder="johndoe"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value.toLowerCase().replace(/\s+/g, "") })}
                icon={<User className="w-4 h-4" />}
                required
              />
              <Input
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                icon={<Mail className="w-4 h-4" />}
                required
              />
              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Min. 8 characters"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
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

              {/* Password strength */}
              {form.password && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-1.5">
                  <div className="flex gap-1">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-all ${
                        form.password.length > i * 3
                          ? form.password.length >= 12 ? "bg-emerald-400"
                            : form.password.length >= 8 ? "bg-amber-400"
                            : "bg-red-400"
                          : "bg-white/10"
                      }`} />
                    ))}
                  </div>
                  <p className="text-xs text-slate-500">
                    {form.password.length < 8 ? "Too short" : form.password.length < 12 ? "Good" : "Strong password"}
                  </p>
                </motion.div>
              )}

              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2"
                >
                  {error}
                </motion.p>
              )}

              <Button type="submit" loading={isPending} size="lg" className="w-full gap-2 mt-2">
                Create Account
                <ArrowRight className="w-4 h-4" />
              </Button>
            </form>

            <p className="text-center text-xs text-slate-500 mt-4">
              By creating an account, you agree to our Terms and Privacy Policy
            </p>

            <div className="mt-5 text-center">
              <p className="text-slate-400 text-sm">
                Already have an account?{" "}
                <Link href="/login" className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors">
                  Sign in →
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right — feature list */}
      <div className="hidden lg:flex flex-1 flex-col justify-center px-16 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-400/5 to-cyan-400/5" />
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="relative max-w-md"
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400/20 to-purple-400/20 border border-white/10 flex items-center justify-center mb-6">
            <Shield className="w-9 h-9 text-cyan-400" />
          </div>

          <h2 className="text-3xl font-bold text-white mb-2">Everything you need</h2>
          <p className="text-slate-400 mb-8">to protect your digital identity from sophisticated threats.</p>

          <div className="space-y-3">
            {FEATURES.map((feature, i) => (
              <motion.div
                key={feature}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.08 }}
                className="flex items-center gap-3"
              >
                <div className="w-6 h-6 rounded-full bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-3.5 h-3.5 text-cyan-400" />
                </div>
                <span className="text-slate-300">{feature}</span>
              </motion.div>
            ))}
          </div>

          <div className="mt-10 p-5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <p className="text-sm text-slate-300 font-medium">Free to get started</p>
            <p className="text-xs text-slate-500 mt-1">
              No credit card required. Full access to AI scanning tools immediately after signup.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

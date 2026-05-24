"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  User, Bell, Shield, Lock, Plus, Trash2, Upload,
  Globe, ChevronRight, Link2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { RiskBadge } from "@/components/security/RiskBadge";
import { useAuthStore } from "@/store/auth.store";
import { useIdentityProfiles, useCreateProfile } from "@/hooks/useIdentity";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { userApi } from "@/lib/api/endpoints";
import { cn } from "@/lib/utils";

const SOCIAL_PLATFORMS = [
  { key: "twitter", label: "Twitter / X", placeholder: "https://twitter.com/username" },
  { key: "linkedin", label: "LinkedIn", placeholder: "https://linkedin.com/in/username" },
  { key: "github", label: "GitHub", placeholder: "https://github.com/username" },
  { key: "website", label: "Website", placeholder: "https://yoursite.com" },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"profile" | "identity" | "notifications" | "security">("profile");

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "identity", label: "Identity Profiles", icon: Shield },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Lock },
  ] as const;

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-slate-400 mt-1 text-sm">Manage your account and identity protection settings</p>
      </motion.div>

      <div className="flex gap-1 p-1 bg-white/[0.03] rounded-xl border border-white/[0.06] w-fit">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
              activeTab === id
                ? "bg-cyan-400/10 text-cyan-400 border border-cyan-400/20"
                : "text-slate-400 hover:text-white"
            )}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        {activeTab === "profile" && <ProfileSettings />}
        {activeTab === "identity" && <IdentitySettings />}
        {activeTab === "notifications" && <NotificationSettings />}
        {activeTab === "security" && <SecuritySettings />}
      </motion.div>
    </div>
  );
}

function ProfileSettings() {
  const { user, updateUser } = useAuthStore();
  const qc = useQueryClient();
  const [fullName, setFullName] = useState(user?.full_name || "");
  const [phone, setPhone] = useState(user?.phone || "");

  const { mutate: update, isPending } = useMutation({
    mutationFn: () => userApi.updateMe({ full_name: fullName, phone }),
    onSuccess: (updated) => {
      updateUser(updated);
      qc.invalidateQueries({ queryKey: ["me"] });
    },
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Avatar */}
      <Card>
        <CardHeader><CardTitle>Profile Photo</CardTitle></CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <div className="w-24 h-24 rounded-full border-2 border-cyan-400/30 bg-cyan-400/10 flex items-center justify-center">
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
            ) : (
              <User className="w-10 h-10 text-cyan-400" />
            )}
          </div>
          <div className="text-center">
            <p className="text-white font-medium">{user?.full_name || user?.username}</p>
            <p className="text-sm text-slate-400">{user?.email}</p>
          </div>
          <Button variant="outline" size="sm" className="gap-2 w-full">
            <Upload className="w-3.5 h-3.5" />
            Upload Photo
          </Button>
          <div className="w-full pt-2 border-t border-white/[0.06]">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Role</span>
              <Badge variant="default" className="capitalize">{user?.role}</Badge>
            </div>
            <div className="flex justify-between text-xs mt-2">
              <span className="text-slate-400">Member since</span>
              <span className="text-slate-300">{user?.created_at ? new Date(user.created_at).getFullYear() : "—"}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile info */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Update your account details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="John Doe" />
            <Input label="Username" value={user?.username || ""} disabled className="opacity-60" />
          </div>
          <Input label="Email" value={user?.email || ""} disabled className="opacity-60" />
          <Input label="Phone (optional)" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 234 567 8900" />

          <Button onClick={() => update()} loading={isPending} className="w-full sm:w-auto">
            Save Changes
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function IdentitySettings() {
  const { data: profiles } = useIdentityProfiles();
  const { mutate: create, isPending: creating } = useCreateProfile();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ full_name: "", email: "", bio: "", location: "" });
  const [socialLinks, setSocialLinks] = useState<Record<string, string>>({});

  const handleCreate = () => {
    create({ ...form, social_links: socialLinks }, {
      onSuccess: () => { setShowForm(false); setForm({ full_name: "", email: "", bio: "", location: "" }); }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Identity Profiles</h2>
          <p className="text-sm text-slate-400">Identities being monitored for theft or impersonation</p>
        </div>
        <Button variant="cyber" onClick={() => setShowForm(!showForm)} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Profile
        </Button>
      </div>

      {showForm && (
        <Card glow="cyan">
          <CardHeader>
            <CardTitle>New Identity Profile</CardTitle>
            <CardDescription>Add details to monitor for impersonation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input label="Full Name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
              <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <Input label="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Social Media Links</label>
              {SOCIAL_PLATFORMS.map(({ key, label, placeholder  }) => (
                <Input
                  key={key}
                  placeholder={`${label}: ${placeholder}`}
                  value={socialLinks[key] || ""}
                  onChange={(e) => setSocialLinks({ ...socialLinks, [key]: e.target.value })}
                />
              ))}
            </div>
            <div className="flex gap-3">
              <Button onClick={handleCreate} loading={creating}>Create Profile</Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {profiles?.map((profile) => (
          <Card key={profile.id} className="hover:border-white/10 transition-all">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center text-cyan-400 font-bold">
                    {(profile.full_name || profile.email || "?")[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-white">{profile.full_name || "Unnamed Profile"}</p>
                    <p className="text-sm text-slate-400">{profile.email || "No email"}</p>
                    {profile.is_primary && <Badge variant="default" className="mt-1">Primary</Badge>}
                  </div>
                </div>
                <RiskBadge level={profile.risk_level} score={profile.risk_score} size="sm" showScore />
              </div>

              {Object.keys(profile.social_links).length > 0 && (
                <div className="flex gap-2 mt-3 pt-3 border-t border-white/[0.06] flex-wrap">
                  {Object.entries(profile.social_links).map(([platform]) => (
                    <Badge key={platform} variant="ghost" className="capitalize text-[10px]">{platform}</Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function NotificationSettings() {
  const { user, updateUser } = useAuthStore();
  const qc = useQueryClient();
  const [prefs, setPrefs] = useState({
    notify_email: user?.notify_email ?? true,
    notify_sms: user?.notify_sms ?? false,
    notify_push: user?.notify_push ?? true,
  });

  const { mutate: save, isPending } = useMutation({
    mutationFn: () => userApi.updateMe(prefs),
    onSuccess: (updated) => { updateUser(updated); qc.invalidateQueries({ queryKey: ["me"] }); },
  });

  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
        <CardDescription>Choose how you receive security alerts</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {[
          { key: "notify_email", label: "Email Notifications", desc: "Get security alerts via email", color: "text-cyan-400" },
          { key: "notify_sms", label: "SMS Notifications", desc: "Receive critical alerts via SMS", color: "text-purple-400" },
          { key: "notify_push", label: "Push Notifications", desc: "Browser push notifications", color: "text-emerald-400" },
        ].map(({ key, label, desc, color }) => (
          <div key={key} className="flex items-center justify-between p-4 rounded-xl border border-white/[0.06] bg-white/[0.02]">
            <div>
              <p className="text-sm font-medium text-white">{label}</p>
              <p className="text-xs text-slate-400">{desc}</p>
            </div>
            <button
              onClick={() => setPrefs((p) => ({ ...p, [key]: !p[key as keyof typeof p] }))}
              className={cn(
                "relative w-12 h-6 rounded-full border transition-all",
                prefs[key as keyof typeof prefs]
                  ? "bg-cyan-400/20 border-cyan-400/40"
                  : "bg-white/[0.05] border-white/10"
              )}
            >
              <span className={cn(
                "absolute top-0.5 left-0.5 w-5 h-5 rounded-full transition-all",
                prefs[key as keyof typeof prefs]
                  ? "translate-x-6 bg-cyan-400"
                  : "translate-x-0 bg-slate-500"
              )} />
            </button>
          </div>
        ))}
        <Button onClick={() => save()} loading={isPending} className="w-full">Save Preferences</Button>
      </CardContent>
    </Card>
  );
}

function SecuritySettings() {
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const { mutate: changePwd, isPending } = useMutation({
    mutationFn: () => userApi.changePassword({ current_password: currentPwd, new_password: newPwd }),
    onSuccess: () => { setCurrentPwd(""); setNewPwd(""); },
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Update your account password</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input label="Current Password" type="password" value={currentPwd} onChange={(e) => setCurrentPwd(e.target.value)} />
          <Input label="New Password" type="password" value={newPwd} onChange={(e) => setNewPwd(e.target.value)} />
          <Button onClick={() => changePwd()} loading={isPending} disabled={!currentPwd || !newPwd || newPwd.length < 8} className="w-full">
            Update Password
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Security Status</CardTitle>
          <CardDescription>Your account security overview</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { label: "Two-Factor Auth", status: "Not enabled", ok: false },
            { label: "Active Sessions", status: "1 session", ok: true },
            { label: "Login Alerts", status: "Enabled", ok: true },
            { label: "Password Strength", status: "Strong", ok: true },
          ].map(({ label, status, ok }) => (
            <div key={label} className="flex items-center justify-between p-3 rounded-lg border border-white/[0.06] bg-white/[0.02]">
              <span className="text-sm text-slate-300">{label}</span>
              <span className={cn("text-xs font-medium", ok ? "text-emerald-400" : "text-amber-400")}>{status}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

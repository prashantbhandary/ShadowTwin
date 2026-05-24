import { api } from "./client";
import type {
  User, TokenResponse, IdentityProfile, Alert, AlertStats,
  FaceCompareResult, DeepfakeResult, EmailLeakResult, OSINTResult, FakeProfileResult,
} from "@/types";

// Auth
export const authApi = {
  register: (data: { email: string; username: string; full_name?: string; password: string }) =>
    api.post<TokenResponse>("/auth/register", data),

  login: (data: { email: string; password: string }) =>
    api.post<TokenResponse>("/auth/login", data),

  refresh: (refresh_token: string) =>
    api.post<TokenResponse>("/auth/refresh", { refresh_token }),

  logout: () => api.post("/auth/logout"),
};

// Users
export const userApi = {
  getMe: () => api.get<User>("/users/me"),

  updateMe: (data: Partial<User>) => api.patch<User>("/users/me", data),

  uploadAvatar: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return api.upload<User>("/users/me/avatar", form);
  },

  changePassword: (data: { current_password: string; new_password: string }) =>
    api.post("/users/me/change-password", data),
};

// Identity profiles
export const identityApi = {
  getProfiles: () => api.get<IdentityProfile[]>("/identity/profiles"),

  createProfile: (data: Partial<IdentityProfile>) =>
    api.post<IdentityProfile>("/identity/profiles", data),

  getProfile: (id: number) => api.get<IdentityProfile>(`/identity/profiles/${id}`),

  updateProfile: (id: number, data: Partial<IdentityProfile>) =>
    api.patch<IdentityProfile>(`/identity/profiles/${id}`, data),

  uploadPhoto: (profileId: number, file: File) => {
    const form = new FormData();
    form.append("file", file);
    return api.upload<IdentityProfile>(`/identity/profiles/${profileId}/photos`, form);
  },

  deleteProfile: (id: number) => api.delete(`/identity/profiles/${id}`),
};

// Alerts
export const alertsApi = {
  getAlerts: (params?: {
    skip?: number;
    limit?: number;
    unread_only?: boolean;
  }) => api.get<Alert[]>("/alerts", { params }),

  getStats: () => api.get<AlertStats>("/alerts/stats"),

  updateAlert: (id: number, data: { is_read?: boolean; is_resolved?: boolean; is_dismissed?: boolean }) =>
    api.patch<Alert>(`/alerts/${id}`, data),

  markAllRead: () => api.post("/alerts/mark-all-read"),
};

// Scans
export const scansApi = {
  compareFaces: (img1: File, img2: File) => {
    const form = new FormData();
    form.append("img1", img1);
    form.append("img2", img2);
    return api.upload<FaceCompareResult>("/scans/face-compare", form);
  },

  detectDeepfake: (image: File) => {
    const form = new FormData();
    form.append("image", image);
    return api.upload<DeepfakeResult>("/scans/deepfake-detect", form);
  },

  checkEmailLeak: (email: string) =>
    api.post<EmailLeakResult>(`/scans/email-leak?email=${encodeURIComponent(email)}`),

  runOSINT: (query: string, scan_type: string = "username") =>
    api.post<OSINTResult>(`/scans/osint?query=${encodeURIComponent(query)}&scan_type=${scan_type}`),

  detectFakeProfile: (profile_url: string) =>
    api.post<FakeProfileResult>(`/scans/fake-profile?profile_url=${encodeURIComponent(profile_url)}`),

  runFullScan: (data: { identity_profile_id: number; scan_types: string[] }) =>
    api.post("/scans/full-scan", data),
};

// User types
export type UserRole = "user" | "admin" | "premium";

export interface User {
  id: number;
  email: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  is_active: boolean;
  is_verified: boolean;
  phone: string | null;
  notify_email: boolean;
  notify_sms: boolean;
  notify_push: boolean;
  created_at: string;
  last_login: string | null;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: User;
}

// Identity profile types
export type RiskLevel = "low" | "medium" | "high" | "critical";

export interface IdentityProfile {
  id: number;
  user_id: number;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  bio: string | null;
  social_links: Record<string, string>;
  photos: string[];
  risk_score: number;
  risk_level: RiskLevel;
  last_scan_at: string | null;
  is_primary: boolean;
  created_at: string;
}

// Alert types
export type AlertType =
  | "fake_profile"
  | "image_copy"
  | "email_leak"
  | "deepfake"
  | "osint_hit"
  | "risk_increase"
  | "username_squatting";

export type AlertSeverity = "info" | "low" | "medium" | "high" | "critical";

export interface Alert {
  id: number;
  user_id: number;
  alert_type: AlertType;
  severity: AlertSeverity;
  title: string;
  description: string | null;
  evidence_url: string | null;
  evidence_data: Record<string, unknown>;
  threat_score: number;
  is_read: boolean;
  is_resolved: boolean;
  is_dismissed: boolean;
  created_at: string;
}

export interface AlertStats {
  total: number;
  unread: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  by_type: Record<string, number>;
}

// Scan result types
export interface FaceCompareResult {
  verified: boolean;
  distance: number;
  similarity_percentage: number;
  label: string;
  risk_level: RiskLevel;
  threat_score: number;
  model: string;
  metric: string;
  threshold: number;
  analysis: string;
  mock?: boolean;
}

export interface DeepfakeResult {
  is_deepfake: boolean;
  deepfake_probability: number;
  confidence: number;
  risk_level: RiskLevel;
  label: string;
  checks: Record<string, { name: string; value: unknown; suspicious: boolean; description: string }>;
  explanation: string;
  analyzed_at: string;
  mock?: boolean;
}

export interface EmailLeakResult {
  email: string;
  is_compromised: boolean;
  total_breaches: number;
  total_pastes: number;
  severity: number;
  severity_label: string;
  breaches: Array<{
    name: string;
    title: string;
    domain: string;
    breach_date: string;
    pwn_count: number;
    data_classes: string[];
    is_verified: boolean;
    is_sensitive: boolean;
  }>;
  recommendations: string[];
  checked_at: string;
  sources: string[];
  mock?: boolean;
}

export interface OSINTResult {
  query: string;
  scan_type: string;
  platforms_checked: number;
  hits_found: number;
  risk_score: number;
  risk_level: RiskLevel;
  results: Array<{
    platform: string;
    url: string;
    found: boolean;
    status_code: number | null;
    suspicious: boolean;
    details: string;
  }>;
  started_at: string;
  completed_at: string;
}

export interface FakeProfileResult {
  profile_url: string;
  platform: string;
  username: string;
  risk_score: number;
  risk_level: RiskLevel;
  risk_label: string;
  is_likely_fake: boolean;
  indicators: Array<{
    indicator: string;
    label: string;
    description: string;
    detected: boolean;
    weight: number;
  }>;
  indicator_count: number;
  recommendation: string;
  analyzed_at: string;
  confidence: number;
}

// Dashboard stats
export interface DashboardStats {
  risk_score: number;
  risk_level: RiskLevel;
  active_threats: number;
  total_scans: number;
  profiles_found: number;
  email_breaches: number;
  last_scan: string | null;
  security_status: "protected" | "at_risk" | "compromised";
}

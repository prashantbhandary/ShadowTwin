"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Scan, User, Mail, Globe, Image as ImageIcon,
  Upload, CheckCircle, AlertTriangle, X, Eye, Zap
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScanningLoader } from "@/components/security/ScanningLoader";
import { RiskBadge } from "@/components/security/RiskBadge";
import { useFaceCompare, useDeepfakeDetect, useEmailLeakCheck, useOSINTScan, useFakeProfileDetect } from "@/hooks/useIdentity";
import { cn, getRiskColor, formatDate } from "@/lib/utils";
import type { FaceCompareResult, DeepfakeResult, EmailLeakResult, OSINTResult, FakeProfileResult } from "@/types";

type ScanTool = "face" | "deepfake" | "email" | "osint" | "fake-profile";

const SCAN_TOOLS: { id: ScanTool; label: string; description: string; icon: any; color: string }[] = [
  { id: "face", label: "Face Similarity", description: "Compare two photos for identity match", icon: User, color: "text-cyan-400" },
  { id: "deepfake", label: "Deepfake Detect", description: "Detect AI-generated or manipulated images", icon: Scan, color: "text-purple-400" },
  { id: "email", label: "Email Leak Check", description: "Check email against data breaches", icon: Mail, color: "text-orange-400" },
  { id: "osint", label: "OSINT Scanner", description: "Find username/name across platforms", icon: Globe, color: "text-emerald-400" },
  { id: "fake-profile", label: "Fake Profile AI", description: "Analyze social media profile for fakes", icon: Eye, color: "text-red-400" },
];

export default function InvestigationPage() {
  const [activeTool, setActiveTool] = useState<ScanTool>("face");

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-white">
          <span className="neon-text">AI</span> Investigation Center
        </h1>
        <p className="text-slate-400 mt-1 text-sm">
          Advanced scanning tools to detect identity threats and impersonation
        </p>
      </motion.div>

      {/* Tool selector */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {SCAN_TOOLS.map((tool, i) => (
          <motion.button
            key={tool.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => setActiveTool(tool.id)}
            className={cn(
              "p-4 rounded-xl border text-left transition-all duration-200",
              activeTool === tool.id
                ? "bg-cyan-400/10 border-cyan-400/30 shadow-[0_0_20px_rgba(0,245,255,0.1)]"
                : "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04] hover:border-white/10"
            )}
          >
            <tool.icon className={cn("w-5 h-5 mb-2", tool.color)} />
            <p className={cn("text-sm font-medium", activeTool === tool.id ? "text-white" : "text-slate-300")}>
              {tool.label}
            </p>
            <p className="text-xs text-slate-500 mt-0.5 hidden sm:block">{tool.description}</p>
          </motion.button>
        ))}
      </div>

      {/* Tool panels */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTool}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTool === "face" && <FaceSimilarityTool />}
          {activeTool === "deepfake" && <DeepfakeTool />}
          {activeTool === "email" && <EmailLeakTool />}
          {activeTool === "osint" && <OSINTTool />}
          {activeTool === "fake-profile" && <FakeProfileTool />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ── Face Similarity Tool ── */
function FaceSimilarityTool() {
  const [img1, setImg1] = useState<File | null>(null);
  const [img2, setImg2] = useState<File | null>(null);
  const [result, setResult] = useState<FaceCompareResult | null>(null);
  const { mutate: compare, isPending } = useFaceCompare();

  const handleCompare = () => {
    if (!img1 || !img2) return;
    compare(
      { img1, img2 },
      { onSuccess: setResult, onError: (e: any) => console.error(e) }
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Face Similarity Analysis</CardTitle>
          <CardDescription>Upload two images to check if they contain the same person</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <ImageUpload label="Your Photo" onSelect={setImg1} file={img1} />
            <ImageUpload label="Suspect Photo" onSelect={setImg2} file={img2} />
          </div>
          <Button
            onClick={handleCompare}
            disabled={!img1 || !img2}
            loading={isPending}
            className="w-full"
            size="lg"
          >
            <Scan className="w-4 h-4 mr-2" />
            {isPending ? "Analyzing..." : "Compare Faces"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Analysis Result</CardTitle>
        </CardHeader>
        <CardContent>
          {isPending ? (
            <ScanningLoader message="Analyzing faces..." subMessage="Running VGG-Face neural network" />
          ) : result ? (
            <FaceResult result={result} />
          ) : (
            <EmptyState icon={User} message="Upload two photos to begin analysis" />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function FaceResult({ result }: { result: FaceCompareResult }) {
  const color = result.risk_level === "critical" || result.risk_level === "high"
    ? "text-red-400" : result.risk_level === "medium" ? "text-amber-400" : "text-emerald-400";

  return (
    <div className="space-y-6">
      {/* Similarity circle */}
      <div className="flex flex-col items-center">
        <div className={cn("w-32 h-32 rounded-full border-4 flex items-center justify-center", color, "border-current/30 bg-current/5")}>
          <div className="text-center">
            <p className={cn("text-3xl font-bold font-mono", color)}>{result.similarity_percentage}%</p>
            <p className="text-xs text-slate-400">similarity</p>
          </div>
        </div>
        <p className={cn("mt-3 font-semibold text-lg", color)}>{result.label}</p>
        <RiskBadge level={result.risk_level} size="sm" showIcon />
      </div>

      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">Similarity</span>
          <Progress value={result.similarity_percentage} className="w-32" />
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">Distance</span>
          <span className="text-white font-mono">{result.distance.toFixed(4)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">Model</span>
          <span className="text-white">{result.model}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">Verified</span>
          <span className={result.verified ? "text-red-400" : "text-emerald-400"}>
            {result.verified ? "Same Person" : "Different Person"}
          </span>
        </div>
      </div>

      <div className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.06]">
        <p className="text-sm text-slate-300">{result.analysis}</p>
      </div>

      {result.mock && (
        <Badge variant="ghost" className="text-xs">Demo mode — install DeepFace for real results</Badge>
      )}
    </div>
  );
}

/* ── Deepfake Tool ── */
function DeepfakeTool() {
  const [image, setImage] = useState<File | null>(null);
  const [result, setResult] = useState<DeepfakeResult | null>(null);
  const { mutate: detect, isPending } = useDeepfakeDetect();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Deepfake Detection</CardTitle>
          <CardDescription>Upload an image to check if it was AI-generated or manipulated</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ImageUpload label="Image to Analyze" onSelect={setImage} file={image} fullWidth />
          <Button
            onClick={() => image && detect(image, { onSuccess: setResult })}
            disabled={!image}
            loading={isPending}
            className="w-full"
            size="lg"
          >
            <Scan className="w-4 h-4 mr-2" />
            Analyze for Deepfake
          </Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Detection Result</CardTitle></CardHeader>
        <CardContent>
          {isPending ? (
            <ScanningLoader message="Detecting deepfake..." subMessage="Running image forensics analysis" />
          ) : result ? (
            <DeepfakeResultView result={result} />
          ) : (
            <EmptyState icon={Scan} message="Upload an image to detect deepfakes" />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function DeepfakeResultView({ result }: { result: DeepfakeResult }) {
  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className={cn(
          "w-20 h-20 rounded-full border-2 flex items-center justify-center mx-auto",
          result.is_deepfake ? "border-red-400/50 bg-red-400/10" : "border-emerald-400/50 bg-emerald-400/10"
        )}>
          {result.is_deepfake ? (
            <AlertTriangle className="w-8 h-8 text-red-400" />
          ) : (
            <CheckCircle className="w-8 h-8 text-emerald-400" />
          )}
        </div>
        <p className={cn("mt-2 font-bold text-lg", result.is_deepfake ? "text-red-400" : "text-emerald-400")}>
          {result.label}
        </p>
        <p className="text-sm text-slate-400">{result.deepfake_probability}% probability</p>
      </div>

      <Progress
        value={result.deepfake_probability}
        indicatorClassName={result.is_deepfake ? "bg-gradient-to-r from-red-500 to-red-400" : "bg-gradient-to-r from-emerald-500 to-emerald-400"}
        showValue
      />

      <div className="space-y-2">
        {Object.values(result.checks).map((check: any) => (
          <div key={check.name} className={cn(
            "flex items-center justify-between p-2.5 rounded-lg border",
            check.suspicious ? "bg-red-400/5 border-red-400/20" : "bg-white/[0.02] border-white/[0.05]"
          )}>
            <span className="text-sm text-slate-300">{check.name}</span>
            <span className={cn("text-xs font-medium", check.suspicious ? "text-red-400" : "text-emerald-400")}>
              {check.suspicious ? "Suspicious" : "Normal"}
            </span>
          </div>
        ))}
      </div>

      <p className="text-sm text-slate-400 p-3 bg-white/[0.02] rounded-lg border border-white/[0.05]">
        {result.explanation}
      </p>
    </div>
  );
}

/* ── Email Leak Tool ── */
function EmailLeakTool() {
  const [email, setEmail] = useState("");
  const [result, setResult] = useState<EmailLeakResult | null>(null);
  const { mutate: check, isPending } = useEmailLeakCheck();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Email Breach Check</CardTitle>
          <CardDescription>Check if your email has been exposed in known data breaches</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<Mail className="w-4 h-4" />}
          />
          <Button
            onClick={() => email && check(email, { onSuccess: setResult })}
            disabled={!email}
            loading={isPending}
            className="w-full"
            size="lg"
          >
            <Mail className="w-4 h-4 mr-2" />
            Check for Breaches
          </Button>
          <p className="text-xs text-slate-500 text-center">
            Powered by Have I Been Pwned database
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Breach Report</CardTitle></CardHeader>
        <CardContent>
          {isPending ? (
            <ScanningLoader message="Checking breaches..." subMessage="Querying breach databases" />
          ) : result ? (
            <EmailLeakResultView result={result} />
          ) : (
            <EmptyState icon={Mail} message="Enter an email to check for data breaches" />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function EmailLeakResultView({ result }: { result: EmailLeakResult }) {
  return (
    <div className="space-y-4">
      <div className={cn(
        "p-4 rounded-xl border text-center",
        result.is_compromised ? "bg-red-400/10 border-red-400/30" : "bg-emerald-400/10 border-emerald-400/30"
      )}>
        <p className={cn("font-bold text-xl", result.is_compromised ? "text-red-400" : "text-emerald-400")}>
          {result.is_compromised ? "⚠ Compromised" : "✓ Safe"}
        </p>
        <p className="text-sm text-slate-400 mt-1">{result.severity_label}</p>
        <p className="text-xs text-slate-500 mt-1">
          Found in {result.total_breaches} breach{result.total_breaches !== 1 ? "es" : ""}
        </p>
      </div>

      {result.breaches.length > 0 && (
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {result.breaches.map((breach) => (
            <div key={breach.name} className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06]">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-white">{breach.title}</p>
                <span className="text-xs text-slate-500">{breach.breach_date}</span>
              </div>
              <div className="flex gap-1 flex-wrap mt-1">
                {breach.data_classes.slice(0, 3).map((dc) => (
                  <Badge key={dc} variant="ghost" className="text-[10px]">{dc}</Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {result.recommendations.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Recommendations</p>
          {result.recommendations.slice(0, 3).map((rec, i) => (
            <p key={i} className="text-xs text-slate-300 flex gap-2">
              <span className="text-cyan-400 mt-0.5">→</span> {rec}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── OSINT Tool ── */
function OSINTTool() {
  const [query, setQuery] = useState("");
  const [scanType, setScanType] = useState("username");
  const [result, setResult] = useState<OSINTResult | null>(null);
  const { mutate: scan, isPending } = useOSINTScan();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>OSINT Scanner</CardTitle>
          <CardDescription>Search for your identity presence across the internet</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            {["username", "email", "name"].map((t) => (
              <button
                key={t}
                onClick={() => setScanType(t)}
                className={cn(
                  "flex-1 py-2 rounded-lg text-sm font-medium border transition-all capitalize",
                  scanType === t
                    ? "bg-cyan-400/10 border-cyan-400/30 text-cyan-400"
                    : "bg-white/[0.02] border-white/[0.06] text-slate-400 hover:text-white"
                )}
              >
                {t}
              </button>
            ))}
          </div>
          <Input
            placeholder={scanType === "username" ? "@username" : scanType === "email" ? "email@example.com" : "Full Name"}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            icon={<Globe className="w-4 h-4" />}
          />
          <Button
            onClick={() => query && scan({ query, scanType }, { onSuccess: setResult })}
            disabled={!query}
            loading={isPending}
            className="w-full"
            size="lg"
          >
            <Globe className="w-4 h-4 mr-2" />
            Scan Platforms
          </Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>OSINT Results</CardTitle></CardHeader>
        <CardContent>
          {isPending ? (
            <ScanningLoader message="Scanning platforms..." subMessage={`Checking ${15} social platforms`} />
          ) : result ? (
            <OSINTResultView result={result} />
          ) : (
            <EmptyState icon={Globe} message="Enter a username or name to scan" />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function OSINTResultView({ result }: { result: OSINTResult }) {
  const hits = result.results.filter((r) => r.found);
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.06]">
          <p className="text-lg font-bold text-white">{result.platforms_checked}</p>
          <p className="text-xs text-slate-400">Checked</p>
        </div>
        <div className="p-2 rounded-lg bg-cyan-400/5 border border-cyan-400/20">
          <p className="text-lg font-bold text-cyan-400">{result.hits_found}</p>
          <p className="text-xs text-slate-400">Found</p>
        </div>
        <div className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.06]">
          <p className={cn("text-lg font-bold", getRiskColor(result.risk_level))}>{result.risk_score}</p>
          <p className="text-xs text-slate-400">Risk Score</p>
        </div>
      </div>

      <div className="space-y-1.5 max-h-64 overflow-y-auto">
        {result.results.filter((r) => r.found).map((r) => (
          <a key={r.platform} href={r.url} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.05] transition-all"
          >
            <span className="text-sm text-white capitalize">{r.platform}</span>
            <Badge variant={r.suspicious ? "critical" : "low"}>
              {r.suspicious ? "Suspicious" : "Found"}
            </Badge>
          </a>
        ))}
      </div>
    </div>
  );
}

/* ── Fake Profile Tool ── */
function FakeProfileTool() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<FakeProfileResult | null>(null);
  const { mutate: detect, isPending } = useFakeProfileDetect();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Fake Profile Detector</CardTitle>
          <CardDescription>AI analysis of social media profiles for fake indicators</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Profile URL"
            placeholder="https://twitter.com/username"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            icon={<Eye className="w-4 h-4" />}
          />
          <Button
            onClick={() => url && detect(url, { onSuccess: setResult })}
            disabled={!url}
            loading={isPending}
            className="w-full"
            size="lg"
          >
            <Eye className="w-4 h-4 mr-2" />
            Analyze Profile
          </Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Profile Analysis</CardTitle></CardHeader>
        <CardContent>
          {isPending ? (
            <ScanningLoader message="Analyzing profile..." subMessage="Running 8 AI checks" />
          ) : result ? (
            <FakeProfileResultView result={result} />
          ) : (
            <EmptyState icon={Eye} message="Enter a profile URL to analyze" />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function FakeProfileResultView({ result }: { result: FakeProfileResult }) {
  return (
    <div className="space-y-4">
      <div className="text-center">
        <p className={cn("text-3xl font-bold font-mono",
          result.risk_level === "critical" ? "text-red-400" :
          result.risk_level === "high" ? "text-orange-400" :
          result.risk_level === "medium" ? "text-amber-400" : "text-emerald-400"
        )}>
          {Math.round(result.risk_score)}%
        </p>
        <p className="text-sm text-slate-400">Fake Score</p>
        <RiskBadge level={result.risk_level} size="md" showIcon className="mt-2" />
        <p className="text-sm text-white mt-2 font-medium">{result.risk_label}</p>
      </div>

      <Progress
        value={result.risk_score}
        indicatorClassName={
          result.risk_score >= 75 ? "bg-gradient-to-r from-red-500 to-red-400" :
          result.risk_score >= 50 ? "bg-gradient-to-r from-orange-500 to-orange-400" :
          result.risk_score >= 25 ? "bg-gradient-to-r from-amber-500 to-amber-400" :
          "bg-gradient-to-r from-emerald-500 to-emerald-400"
        }
        showValue
      />

      <div className="space-y-1.5 max-h-48 overflow-y-auto">
        {result.indicators.map((ind) => (
          <div key={ind.indicator} className={cn(
            "flex items-center justify-between p-2.5 rounded-lg border text-sm",
            ind.detected ? "bg-red-400/5 border-red-400/20" : "bg-white/[0.02] border-white/[0.05]"
          )}>
            <span className={ind.detected ? "text-white" : "text-slate-400"}>{ind.label}</span>
            <span className={ind.detected ? "text-red-400 text-xs" : "text-emerald-400 text-xs"}>
              {ind.detected ? "Detected" : "Clear"}
            </span>
          </div>
        ))}
      </div>

      <p className="text-xs text-slate-400 p-3 bg-white/[0.02] rounded-lg border border-white/[0.05]">
        {result.recommendation}
      </p>
    </div>
  );
}

/* ── Shared helpers ── */
function ImageUpload({ label, onSelect, file, fullWidth }: {
  label: string; onSelect: (f: File) => void; file: File | null; fullWidth?: boolean;
}) {
  return (
    <label className={cn("block cursor-pointer", fullWidth && "col-span-2")}>
      <span className="text-sm text-slate-300 block mb-1.5">{label}</span>
      <div className={cn(
        "border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-all",
        "hover:border-cyan-400/50 hover:bg-cyan-400/5",
        file ? "border-cyan-400/40 bg-cyan-400/5 h-32" : "border-white/10 h-32"
      )}>
        {file ? (
          <div className="text-center">
            <CheckCircle className="w-6 h-6 text-cyan-400 mx-auto" />
            <p className="text-xs text-cyan-400 mt-1">{file.name}</p>
          </div>
        ) : (
          <div className="text-center">
            <Upload className="w-6 h-6 text-slate-500 mx-auto" />
            <p className="text-xs text-slate-500 mt-1">Click to upload</p>
          </div>
        )}
        <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && onSelect(e.target.files[0])} />
      </div>
    </label>
  );
}

function EmptyState({ icon: Icon, message }: { icon: any; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
      <div className="w-14 h-14 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center">
        <Icon className="w-6 h-6 text-slate-500" />
      </div>
      <p className="text-slate-400 text-sm">{message}</p>
    </div>
  );
}

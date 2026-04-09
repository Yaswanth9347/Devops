import { CheckCircle2, AlertCircle, Clock, PlayCircle, StopCircle, RefreshCw, Loader2 } from "lucide-react";

const STATUS_CONFIG = {
  pending:   { bg: "var(--warning-bg)", color: "var(--warning-color)", border: "var(--warning-border)", label: "Pending", icon: Clock },
  cloning:   { bg: "var(--primary-bg)", color: "var(--primary-color)", border: "var(--border-default)", label: "Cloning", icon: RefreshCw },
  building:  { bg: "var(--warning-bg)", color: "var(--warning-color)", border: "var(--warning-border)", label: "Building", icon: Loader2 },
  deploying: { bg: "var(--primary-bg)", color: "var(--primary-color)", border: "var(--border-default)", label: "Deploying", icon: PlayCircle },
  running:   { bg: "var(--success-bg)", color: "var(--success-color)", border: "var(--success-border)", label: "Running", icon: CheckCircle2 },
  completed: { bg: "var(--success-bg)", color: "var(--success-color)", border: "var(--success-border)", label: "Completed", icon: CheckCircle2 },
  failed:    { bg: "var(--error-bg)", color: "var(--error-color)", border: "var(--error-border)", label: "Failed", icon: AlertCircle },
  stopped:   { bg: "var(--bg-active)", color: "var(--text-secondary)", border: "var(--border-default)", label: "Stopped", icon: StopCircle },
  unknown:   { bg: "var(--bg-active)", color: "var(--text-secondary)", border: "var(--border-default)", label: "Unknown", icon: Clock },
};

function StatusBadge({ status, size = "sm" }) {
  const cfg = STATUS_CONFIG[status?.toLowerCase()] || STATUS_CONFIG.unknown;
  const padding = size === "lg" ? "6px 12px" : "4px 8px";
  const fontSize = size === "lg" ? "13px" : "12px";
  const iconSize = size === "lg" ? 16 : 14;
  const Icon = cfg.icon;

  const isSpinning = status === "building" || status === "deploying" || status === "cloning";

  return (
    <span style={{
      background: cfg.bg,
      color: cfg.color,
      border: `1px solid ${cfg.border}`,
      padding,
      borderRadius: "16px",
      fontSize,
      fontWeight: "500",
      display: "inline-flex",
      alignItems: "center",
      gap: "6px",
      whiteSpace: "nowrap"
    }}>
      <Icon size={iconSize} className={isSpinning ? "animate-spin" : ""} style={isSpinning ? { animation: "spin 1s linear infinite" } : undefined} />
      {cfg.label}
    </span>
  );
}

export default StatusBadge;

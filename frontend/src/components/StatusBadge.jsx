const STATUS_CONFIG = {
  pending:   { bg: '#f39c12', label: '⏳ Pending' },
  cloning:   { bg: '#3498db', label: '📥 Cloning' },
  building:  { bg: '#9b59b6', label: '🔨 Building' },
  deploying: { bg: '#1abc9c', label: '🚢 Deploying' },
  running:   { bg: '#27ae60', label: '🟢 Running' },
  failed:    { bg: '#e74c3c', label: '🔴 Failed' },
  stopped:   { bg: '#7f8c8d', label: '⚫ Stopped' },
  completed: { bg: '#27ae60', label: '✅ Completed' },
  unknown:   { bg: '#95a5a6', label: '⚪ Unknown' },
};

function StatusBadge({ status, size = "sm" }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.unknown;
  const padding = size === "lg" ? "6px 14px" : "3px 10px";
  const fontSize = size === "lg" ? "0.9em" : "0.75em";

  return (
    <span style={{
      background: cfg.bg,
      color: "#fff",
      padding,
      borderRadius: "20px",
      fontSize,
      fontWeight: "600",
      letterSpacing: "0.3px",
      display: "inline-block",
      whiteSpace: "nowrap"
    }}>
      {cfg.label}
    </span>
  );
}

export default StatusBadge;

const STATUS_CONFIG = {
  pending:   { bg: '#b26a00', label: 'pending' },
  cloning:   { bg: '#1565c0', label: 'cloning' },
  building:  { bg: '#ed6c02', label: 'building' },
  deploying: { bg: '#00897b', label: 'deploying' },
  running:   { bg: '#2e7d32', label: 'running' },
  failed:    { bg: '#c62828', label: 'failed' },
  stopped:   { bg: '#6b7280', label: 'stopped' },
  completed: { bg: '#2e7d32', label: 'completed' },
  unknown:   { bg: '#757575', label: 'unknown' },
};

function StatusBadge({ status, size = "sm" }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.unknown;
  const padding = size === "lg" ? "6px 14px" : "4px 10px";
  const fontSize = size === "lg" ? "0.8em" : "0.72em";

  return (
    <span style={{
      background: cfg.bg,
      color: "#fff",
      padding,
      borderRadius: "20px",
      fontSize,
      fontWeight: "700",
      letterSpacing: "0.5px",
      display: "inline-block",
      whiteSpace: "nowrap"
    }}>
      {cfg.label.toUpperCase()}
    </span>
  );
}

export default StatusBadge;

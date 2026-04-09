function EmptyState({ title, message, action, icon = "📭" }) {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "40px",
        border: "1px dashed #ccc",
        borderRadius: "10px",
        background: "#fafafa",
        color: "#4b5563"
      }}
    >
      {icon && <p style={{ fontSize: "2.2em", margin: "0 0 8px" }}>{icon}</p>}
      <h3 style={{ margin: "0 0 8px", color: "#1f2937" }}>{title}</h3>
      <p style={{ margin: 0 }}>{message}</p>
      {action && <div style={{ marginTop: "12px" }}>{action}</div>}
    </div>
  );
}

export default EmptyState;

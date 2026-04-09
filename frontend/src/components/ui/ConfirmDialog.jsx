import { useEffect } from "react";
import Card from "./Card";
import Button from "./Button";

function ConfirmDialog({
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  confirming = false,
  danger = false
}) {
  useEffect(() => {
    const handler = (event) => {
      if (event.key === "Escape") {
        onCancel();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onCancel]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "16px"
      }}
      onClick={onCancel}
    >
      <Card
        onClick={(event) => event.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: "360px",
          padding: "18px 18px 16px",
          border: "1px solid #e5e7eb",
          boxShadow: "0 8px 30px rgba(0,0,0,0.2)",
          marginBottom: 0
        }}
      >
        <h3 style={{ margin: "0 0 8px", color: "#1a1d2e", fontSize: "1.02em" }}>{title}</h3>
        <p style={{ margin: "0 0 14px", color: "#4b5563", fontSize: "0.9em", lineHeight: 1.5 }}>{message}</p>
        <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end", flexWrap: "wrap" }}>
          <Button onClick={onCancel} disabled={confirming} variant="muted">
            {cancelLabel}
          </Button>
          <Button
            onClick={onConfirm}
            loading={confirming}
            loadingText="Processing..."
            disabled={confirming}
            variant={danger ? "danger" : "primary"}
          >
            {confirmLabel}
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default ConfirmDialog;

import { useEffect } from "react";
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
      className="animate-slide-in"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15, 23, 42, 0.4)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "var(--space-4)"
      }}
      onClick={onCancel}
    >
      <div
        className="card"
        onClick={(event) => event.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: "400px",
          padding: "var(--space-5)",
          boxShadow: "var(--shadow-lg)",
          animation: "slideIn 0.2s ease-out forwards"
        }}
      >
        <h3 style={{ margin: "0 0 var(--space-2)", color: "var(--text-primary)", fontSize: "18px" }}>{title}</h3>
        <p style={{ margin: "0 0 var(--space-5)", color: "var(--text-secondary)", fontSize: "14px", lineHeight: 1.5 }}>{message}</p>
        <div style={{ display: "flex", gap: "var(--space-3)", justifyContent: "flex-end", flexWrap: "wrap" }}>
          <Button onClick={onCancel} disabled={confirming} variant="secondary">
            {cancelLabel}
          </Button>
          <Button
            onClick={onConfirm}
            isLoading={confirming}
            variant={danger ? "danger" : "primary"}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;

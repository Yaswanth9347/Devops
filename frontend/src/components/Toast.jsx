function Toast({ message, type = "info" }) {
  let background = "#1976d2";

  if (type === "success") background = "#27ae60";
  if (type === "error") background = "#d32f2f";

  return (
    <div
      style={{
        position: "fixed",
        top: "20px",
        right: "20px",
        background,
        color: "white",
        padding: "10px 15px",
        borderRadius: "6px",
        boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
        zIndex: 9999,
        opacity: 0.95,
        transition: "all 0.3s ease"
      }}
    >
      {message}
    </div>
  );
}

export default Toast;
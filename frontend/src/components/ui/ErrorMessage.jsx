import Button from "./Button";

function ErrorMessage({ message, onRetry, retryLabel = "Retry", retrying = false }) {
  return (
    <div
      style={{
        border: "1px solid #f5c2c2",
        background: "#fdecea",
        padding: "15px",
        borderRadius: "8px",
        color: "#b71c1c"
      }}
    >
      <p style={{ margin: 0 }}>{message}</p>
      {onRetry && (
        <div style={{ marginTop: "10px" }}>
          <Button onClick={onRetry} loading={retrying} loadingText="Retrying..." variant="danger">
            {retryLabel}
          </Button>
        </div>
      )}
    </div>
  );
}

export default ErrorMessage;

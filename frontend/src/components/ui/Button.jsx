import { colors } from "../../utils/theme";
import Spinner from "./Spinner";

const VARIANT_COLOR = {
  primary: colors.primary,
  info: colors.info,
  success: colors.success,
  danger: colors.danger,
  warning: "#f39c12",
  muted: colors.muted
};

function Button({
  children,
  onClick,
  variant = "primary",
  loading = false,
  loadingText = "Processing...",
  disabled = false,
  htmlType = "button",
  style = {},
  onMouseEnter,
  onMouseLeave
}) {
  const background = VARIANT_COLOR[variant] || VARIANT_COLOR.primary;
  const isDisabled = disabled || loading;

  return (
    <button
      type={htmlType}
      onClick={onClick}
      disabled={isDisabled}
      onMouseEnter={(event) => {
        if (!isDisabled) event.currentTarget.style.opacity = "0.85";
        if (onMouseEnter) onMouseEnter(event);
      }}
      onMouseLeave={(event) => {
        event.currentTarget.style.opacity = isDisabled ? "0.6" : "1";
        if (onMouseLeave) onMouseLeave(event);
      }}
      style={{
        background,
        color: "white",
        border: "none",
        padding: "7px 14px",
        borderRadius: "6px",
        cursor: isDisabled ? "not-allowed" : "pointer",
        opacity: isDisabled ? 0.6 : 1,
        fontWeight: "600",
        transition: "opacity 0.15s ease, transform 0.15s ease",
        ...style
      }}
    >
      {loading ? (
        <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
          <Spinner size={14} borderWidth={2} color="#fff" trackColor="rgba(255,255,255,0.4)" inline />
          <span>{loadingText}</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
}

export default Button;

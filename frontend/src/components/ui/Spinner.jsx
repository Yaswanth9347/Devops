import { colors } from "../../utils/theme";

function Spinner({
  size = 25,
  borderWidth = 3,
  color = colors.primary,
  trackColor = "#ddd",
  inline = false
}) {
  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        border: `${borderWidth}px solid ${trackColor}`,
        borderTop: `${borderWidth}px solid ${color}`,
        borderRadius: "50%",
        animation: "spin 1s linear infinite",
        display: inline ? "inline-block" : "block"
      }}
    />
  );
}

export default Spinner;

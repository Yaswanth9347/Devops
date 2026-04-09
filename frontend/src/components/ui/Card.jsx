import { colors, spacing } from "../../utils/theme";

function Card({ children, style = {}, ...rest }) {
  return (
    <div
      style={{
        border: `1px solid ${colors.border}`,
        padding: "15px",
        borderRadius: "10px",
        background: colors.surface,
        marginBottom: spacing.cardGap,
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
        transition: "box-shadow 0.2s ease, transform 0.2s ease",
        ...style
      }}
      onMouseEnter={(event) => {
        if (rest.onMouseEnter) {
          rest.onMouseEnter(event);
          return;
        }
        event.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
      }}
      onMouseLeave={(event) => {
        if (rest.onMouseLeave) {
          rest.onMouseLeave(event);
          return;
        }
        event.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.04)";
      }}
      {...rest}
    >
      {children}
    </div>
  );
}

export default Card;

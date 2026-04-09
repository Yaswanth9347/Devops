import { colors, spacing } from "../../utils/theme";

function Section({ title, children, style = {}, titleStyle = {} }) {
  return (
    <div style={{ marginBottom: spacing.sectionGap, ...style }}>
      {title && (
        <>
          <h2 style={{ margin: "0 0 10px", color: colors.textPrimary, fontSize: "1.05em", ...titleStyle }}>{title}</h2>
          <hr style={{ border: 0, borderTop: "1px solid #eef1f4", margin: "0 0 12px" }} />
        </>
      )}
      {children}
    </div>
  );
}

export default Section;

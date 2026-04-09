import Card from "./Card";
import { colors } from "../../utils/theme";

function StatCard({ title, value, accent = colors.primary }) {
  return (
    <Card
      style={{
        minWidth: "170px",
        padding: "18px",
        borderLeft: `4px solid ${accent}`,
        marginBottom: 0
      }}
    >
      <p style={{ margin: "0 0 8px", color: colors.textSecondary, fontSize: "0.82em", fontWeight: 600 }}>{title}</p>
      <p style={{ margin: 0, color: colors.textPrimary, fontSize: "1.9em", fontWeight: 700, lineHeight: 1.2 }}>{value}</p>
    </Card>
  );
}

export default StatCard;
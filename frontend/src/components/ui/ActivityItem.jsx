import { formatDate, timeAgo } from "../../utils/date";

const TYPE_STYLE = {
  project: { color: "#2e7d32", icon: "📁" },
  deployment: { color: "#ed6c02", icon: "🚀" },
  failure: { color: "#d32f2f", icon: "⚠️" },
  operation: { color: "#1976d2", icon: "🛠️" }
};

function ActivityItem({ activity }) {
  const style = TYPE_STYLE[activity.type] || TYPE_STYLE.operation;

  return (
    <div
      style={{
        borderLeft: `3px solid ${style.color}`,
        paddingLeft: "12px",
        marginBottom: "12px"
      }}
    >
      <p style={{ margin: "0 0 4px", color: "#1a1d2e", fontSize: "0.9em" }}>
        <span style={{ marginRight: "6px" }}>{style.icon}</span>
        {activity.message}
      </p>
      <small title={formatDate(activity.date)} style={{ color: "#6b7280", fontSize: "0.78em" }}>
        {timeAgo(activity.date)}
      </small>
    </div>
  );
}

export default ActivityItem;
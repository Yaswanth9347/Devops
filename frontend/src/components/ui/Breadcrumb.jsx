import { Link } from "react-router-dom";

function Breadcrumb({ items = [] }) {
  if (!items.length) return null;

  return (
    <div style={{ marginBottom: "15px", fontSize: "14px", color: "#6b7280" }}>
      {items.map((item, index) => (
        <span key={`${item.label}-${index}`}>
          {item.link ? (
            <Link to={item.link} style={{ color: "#3498db", textDecoration: "none" }}>
              {item.label}
            </Link>
          ) : (
            <span style={{ color: "#4b5563", fontWeight: 600 }}>{item.label}</span>
          )}
          {index !== items.length - 1 && " / "}
        </span>
      ))}
    </div>
  );
}

export default Breadcrumb;

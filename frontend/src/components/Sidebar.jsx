import { NavLink } from "react-router-dom";
import { API_URL } from "../config";

const navItems = [
  { to: "/", label: "📊 Dashboard", exact: true },
  { to: "/projects", label: "📁 Projects" },
  { to: "/deployments", label: "🚀 Deployments" },
];

function Sidebar() {
  const backendHost = (() => {
    try {
      return new URL(API_URL).host;
    } catch {
      return API_URL;
    }
  })();

  return (
    <div style={{
      width: "220px",
      minWidth: "220px",
      background: "#1a1d2e",
      color: "white",
      display: "flex",
      flexDirection: "column",
      height: "100vh",
      position: "sticky",
      top: 0
    }}>
      {/* Brand */}
      <div style={{
        padding: "24px 20px",
        borderBottom: "1px solid rgba(255,255,255,0.08)"
      }}>
        <h2 style={{ margin: 0, color: "#1abc9c", fontSize: "1.3em", letterSpacing: "0.5px" }}>
          ⚡ DevDeploy
        </h2>
        <small style={{ color: "#888", fontSize: "0.75em" }}>Platform Dashboard</small>
      </div>

      {/* Nav Links */}
      <nav style={{ padding: "16px 0", flex: 1 }}>
        <h4 style={{ color: "#7f8aa3", fontSize: "0.72em", padding: "0 20px 8px", textTransform: "uppercase", letterSpacing: "1px", margin: 0, fontWeight: 700 }}>
          Platform
        </h4>
        {navItems.map(({ to, label, exact }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            style={({ isActive }) => ({
              display: "block",
              padding: "11px 20px",
              color: isActive ? "#1abc9c" : "#b0b8c8",
              textDecoration: "none",
              background: isActive ? "rgba(26,188,156,0.12)" : "transparent",
              borderLeft: isActive ? "3px solid #1abc9c" : "3px solid transparent",
              fontSize: "0.92em",
              transition: "all 0.15s ease"
            })}
          >
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div style={{
        padding: "16px 20px",
        borderTop: "1px solid rgba(255,255,255,0.08)",
        fontSize: "0.72em",
        color: "#555"
      }}>
        Backend: <span style={{ color: "#1abc9c" }}>{backendHost}</span>
      </div>
    </div>
  );
}

export default Sidebar;

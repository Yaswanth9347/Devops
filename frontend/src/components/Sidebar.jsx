import { useState } from "react";
import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, 
  FolderGit2, 
  Rocket, 
  ChevronLeft, 
  ChevronRight,
  Server
} from "lucide-react";
import { API_URL } from "../config";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/projects", label: "Projects", icon: FolderGit2 },
  { to: "/deployments", label: "Deployments", icon: Rocket },
];

function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const backendHost = (() => {
    try {
      return new URL(API_URL).host;
    } catch {
      return API_URL;
    }
  })();

  return (
    <div style={{
      width: isCollapsed ? "80px" : "240px",
      minWidth: isCollapsed ? "80px" : "240px",
      background: "var(--bg-secondary)",
      borderRight: "1px solid var(--border-default)",
      display: "flex",
      flexDirection: "column",
      height: "100vh",
      position: "sticky",
      top: 0,
      transition: "width 0.3s ease",
      zIndex: 10
    }}>
      {/* Brand */}
      <div style={{
        padding: "var(--space-4)",
        display: "flex",
        alignItems: "center",
        justifyContent: isCollapsed ? "center" : "space-between",
        borderBottom: "1px solid var(--border-default)",
        height: "64px"
      }}>
        {!isCollapsed && (
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
            <div style={{ 
              background: "var(--primary-bg)", 
              color: "var(--primary-color)",
              padding: "var(--space-1)", 
              borderRadius: "var(--radius-sm)" 
            }}>
              <Server size={20} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: "16px", fontWeight: 600, color: "var(--text-primary)" }}>
                DevDeploy
              </h2>
            </div>
          </div>
        )}
        {isCollapsed && (
           <div style={{ 
            background: "var(--primary-bg)", 
            color: "var(--primary-color)",
            padding: "var(--space-1)", 
            borderRadius: "var(--radius-sm)" 
          }}>
            <Server size={20} />
          </div>
        )}
      </div>

      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        style={{
          position: "absolute",
          right: "-12px",
          top: "22px",
          background: "var(--bg-secondary)",
          border: "1px solid var(--border-default)",
          borderRadius: "50%",
          padding: "2px",
          cursor: "pointer",
          color: "var(--text-secondary)",
          boxShadow: "var(--shadow-sm)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
        title="Toggle Sidebar"
      >
        {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      {/* Nav Links */}
      <nav style={{ padding: "var(--space-4) 0", flex: 1, display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
        {!isCollapsed && (
          <h4 style={{ 
            color: "var(--text-tertiary)", 
            fontSize: "11px", 
            padding: "0 var(--space-4) var(--space-2)", 
            textTransform: "uppercase", 
            letterSpacing: "1px", 
            margin: 0, 
            fontWeight: 600 
          }}>
            Platform
          </h4>
        )}
        
        {navItems.map(({ to, label, icon: Icon, exact }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            style={({ isActive }) => ({
              display: "flex",
              alignItems: "center",
              gap: "var(--space-3)",
              padding: "var(--space-2) var(--space-4)",
              margin: "0 var(--space-2)",
              color: isActive ? "var(--primary-color)" : "var(--text-secondary)",
              textDecoration: "none",
              background: isActive ? "var(--primary-bg)" : "transparent",
              borderRadius: "var(--radius-md)",
              fontSize: "14px",
              fontWeight: isActive ? 500 : 400,
              transition: "all 0.15s ease",
              justifyContent: isCollapsed ? "center" : "flex-start"
            })}
            title={isCollapsed ? label : ""}
          >
            <Icon size={18} />
            {!isCollapsed && label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      {!isCollapsed && (
        <div style={{
          padding: "var(--space-4)",
          borderTop: "1px solid var(--border-default)",
          fontSize: "12px",
          color: "var(--text-tertiary)",
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-1)"
        }}>
           <span>Backend</span>
           <span style={{ color: "var(--text-secondary)", fontWeight: 500, fontFamily: "var(--mono-family)" }}>
             {backendHost}
           </span>
        </div>
      )}
    </div>
  );
}

export default Sidebar;

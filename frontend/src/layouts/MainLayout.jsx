import Sidebar from "../components/Sidebar";

function MainLayout({ children }) {
  return (
    <div style={{
      display: "flex",
      height: "100vh",
      background: "#f4f6f9",
      fontFamily: "'Segoe UI', system-ui, sans-serif"
    }}>
      <Sidebar />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Top Header Bar */}
        <div style={{
          padding: "14px 28px",
          background: "#fff",
          borderBottom: "1px solid #e8ecf0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: "0 1px 3px rgba(0,0,0,0.06)"
        }}>
          <span style={{ color: "#555", fontSize: "0.88em" }}>
            ⚡ DevDeploy Platform
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{
              width: "8px", height: "8px", borderRadius: "50%",
              background: "#1abc9c", display: "inline-block"
            }} />
            <span style={{ color: "#888", fontSize: "0.82em" }}>System Online</span>
          </div>
        </div>

        {/* Main Content */}
        <div style={{
          flex: 1,
          overflowY: "auto",
          padding: "28px"
        }}>
          {children}
        </div>
      </div>
    </div>
  );
}

export default MainLayout;

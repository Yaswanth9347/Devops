import Sidebar from "../components/Sidebar";
import Toast from "../components/Toast";
import useToast, { ToastContext } from "../hooks/useToast";
import { APP_VERSION } from "../config";
import { Bell, UserCircle } from "lucide-react";

function MainLayout({ children }) {
  const { toast, showToast } = useToast();

  return (
    <ToastContext.Provider value={{ showToast }}>
      <div className="app-container">
        <Sidebar />

        <div className="main-content-wrapper">
          {/* Top Header Bar */}
          <header style={{
            height: "64px",
            padding: "0 var(--space-6)",
            background: "var(--bg-secondary)",
            borderBottom: "1px solid var(--border-default)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
            zIndex: 5
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
              {/* Optional: Breadcrumbs or Page Title could go here */}
            </div>
            
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)" }}>
              <div style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: "var(--space-2)",
                padding: "var(--space-1) var(--space-2)",
                background: "var(--bg-primary)",
                borderRadius: "var(--radius-lg)",
                border: "1px solid var(--border-default)"
              }}>
                <span className="animate-pulse" style={{
                  width: "8px", height: "8px", borderRadius: "50%",
                  background: "var(--success-color)", display: "inline-block",
                  boxShadow: "0 0 0 2px var(--success-bg)"
                }} />
                <span style={{ color: "var(--text-secondary)", fontSize: "12px", fontWeight: 500 }}>
                  v{APP_VERSION}
                </span>
              </div>
              
              <div style={{ width: "1px", height: "24px", background: "var(--border-default)" }} />
              
              <button style={{ color: "var(--text-secondary)", position: "relative" }}>
                 <Bell size={20} />
                 <span style={{
                    position: "absolute",
                    top: "-2px",
                    right: "-2px",
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: "var(--error-color)",
                    border: "2px solid var(--bg-secondary)"
                 }} />
              </button>
              
              <button style={{ color: "var(--text-secondary)" }}>
                 <UserCircle size={24} />
              </button>
            </div>
          </header>

          {/* Main Content */}
          <main className="scrollarea">
            <div style={{ maxWidth: "1200px", margin: "0 auto", width: "100%" }}>
              {children}
            </div>
          </main>
        </div>

        {toast && <Toast message={toast.message} type={toast.type} />}
      </div>
    </ToastContext.Provider>
  );
}

export default MainLayout;

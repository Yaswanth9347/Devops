import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowLeft, RefreshCw, ExternalLink, Activity, Server, Clock, GitCommit, Play, Copy, Layout } from "lucide-react";
import API from "../services/api";
import Button from "../components/ui/Button";
import StatusBadge from "../components/StatusBadge";
import LogViewer from "../components/ui/LogViewer";
import { useToastContext } from "../hooks/useToast";
import { getRequestErrorMessage } from "../utils/requestErrors";
import { formatDate, timeAgo } from "../utils/date";

function DeploymentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [deployment, setDeployment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("runtime");
  const { showToast } = useToastContext();

  const loadDetails = async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true);
    try {
      const res = await API.get(`/deployments/${id}/details`);
      if (res.data?.success) setDeployment(res.data.data);
    } catch (err) {
      showToast(getRequestErrorMessage(err, "Unable to load deployment details."), "error");
    } finally {
      isRefresh ? setRefreshing(false) : setLoading(false);
    }
  };

  useEffect(() => {
    loadDetails();
    const interval = setInterval(() => loadDetails(true), 10000); // 10s poll
    return () => clearInterval(interval);
  }, [id]);

  if (loading && !deployment) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
        <p style={{ color: "var(--text-secondary)" }}>Loading details...</p>
      </div>
    );
  }

  if (!deployment) return <div>Deployment not found</div>;

  // Process logs for LogViewer
  const rawLogs = activeTab === "runtime" ? deployment.runtime_logs : deployment.build_logs;
  const processedLogs = (rawLogs || "").split("\n").filter(Boolean).map(line => {
    const isError = line.toLowerCase().includes("error") || line.toLowerCase().includes("fail");
    const isWarn = line.toLowerCase().includes("warn");
    let level = "info";
    if (isError) level = "error";
    if (isWarn) level = "warning";
    
    return {
      timestamp: new Date().toLocaleTimeString(), // fake timestamp if none in log
      level,
      message: line
    };
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      {/* Header */}
      <div>
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} icon={ArrowLeft} style={{ marginBottom: "var(--space-2)", paddingLeft: 0 }}>
          Back to Deployments
        </Button>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", marginBottom: "var(--space-1)" }}>
              <h1 style={{ margin: 0 }}>Deployment #{id.toString().substring(0, 8)}</h1>
              <StatusBadge status={deployment.status} size="lg" />
            </div>
            <p style={{ color: "var(--text-secondary)", margin: 0, display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
              Project #{deployment.project_id} • v{deployment.version} • Started {timeAgo(deployment.created_at)}
            </p>
          </div>
          <div style={{ display: "flex", gap: "var(--space-3)" }}>
            <Button variant="secondary" icon={RefreshCw} onClick={() => loadDetails(true)} isLoading={refreshing}>
              Refresh
            </Button>
            {deployment.url && (
              <a href={deployment.url} target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
                 <Button variant="primary" icon={ExternalLink}>Open App</Button>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "var(--space-4)" }}>
        <div className="card" style={{ padding: "var(--space-4)" }}>
           <p style={{ margin: "0 0 4px", fontSize: "13px", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "6px" }}>
             <Activity size={14} /> Pipeline Status
           </p>
           <div style={{ fontSize: "15px", fontWeight: 500 }}><StatusBadge status={deployment.status} /></div>
        </div>
        <div className="card" style={{ padding: "var(--space-4)" }}>
           <p style={{ margin: "0 0 4px", fontSize: "13px", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "6px" }}>
             <Layout size={14} /> Build Status
           </p>
           <div style={{ fontSize: "15px", fontWeight: 500 }}><StatusBadge status={deployment.build_status} /></div>
        </div>
        <div className="card" style={{ padding: "var(--space-4)" }}>
           <p style={{ margin: "0 0 4px", fontSize: "13px", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "6px" }}>
             <Server size={14} /> Assigned Port
           </p>
           <div style={{ fontSize: "15px", fontWeight: 500, color: "var(--text-primary)" }}>{deployment.port || "Pending"}</div>
        </div>
        <div className="card" style={{ padding: "var(--space-4)" }}>
           <p style={{ margin: "0 0 4px", fontSize: "13px", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "6px" }}>
             <GitCommit size={14} /> Version Tag
           </p>
           <div style={{ fontSize: "15px", fontWeight: 500, color: "var(--text-primary)" }}>v{deployment.version}</div>
        </div>
      </div>

      {/* Info Grid */}
      <div className="card" style={{ padding: "var(--space-5)" }}>
        <h3 style={{ margin: "0 0 var(--space-4)", fontSize: "16px" }}>Deployment Details</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "var(--space-5)" }}>
          <div>
            <p style={{ margin: "0 0 4px", fontSize: "13px", color: "var(--text-secondary)" }}>Created</p>
            <p style={{ margin: 0, fontSize: "14px", color: "var(--text-primary)" }}>{formatDate(deployment.created_at)}</p>
          </div>
          <div>
            <p style={{ margin: "0 0 4px", fontSize: "13px", color: "var(--text-secondary)" }}>Image Name</p>
            <p style={{ margin: 0, fontSize: "14px", color: "var(--text-primary)", fontFamily: "var(--mono-family)" }}>{deployment.image || "—"}</p>
          </div>
          <div>
            <p style={{ margin: "0 0 4px", fontSize: "13px", color: "var(--text-secondary)" }}>Runtime Engine</p>
            <p style={{ margin: 0, fontSize: "14px", color: "var(--text-primary)" }}>{deployment.runtime || "Docker"}</p>
          </div>
          <div>
            <p style={{ margin: "0 0 4px", fontSize: "13px", color: "var(--text-secondary)" }}>Health Check</p>
            <p style={{ margin: 0, fontSize: "14px", color: "var(--text-primary)" }}>{deployment.health || "Unknown"}</p>
          </div>
          <div>
            <p style={{ margin: "0 0 4px", fontSize: "13px", color: "var(--text-secondary)" }}>Retries</p>
            <p style={{ margin: 0, fontSize: "14px", color: "var(--text-primary)" }}>{deployment.retry_count} / {deployment.max_retries}</p>
          </div>
          <div>
            <p style={{ margin: "0 0 4px", fontSize: "13px", color: "var(--text-secondary)" }}>Last Error</p>
            <p style={{ margin: 0, fontSize: "14px", color: "var(--error-color)" }}>{deployment.last_error || "None"}</p>
          </div>
        </div>
      </div>

      {/* Logs section */}
      <div>
        <div style={{ display: "flex", gap: "var(--space-2)", marginBottom: "var(--space-3)" }}>
           <button 
             onClick={() => setActiveTab("runtime")}
             style={{
               padding: "8px 16px",
               background: activeTab === "runtime" ? "var(--text-primary)" : "transparent",
               color: activeTab === "runtime" ? "var(--bg-primary)" : "var(--text-secondary)",
               border: `1px solid ${activeTab === "runtime" ? "var(--text-primary)" : "var(--border-default)"}`,
               borderRadius: "var(--radius-md)",
               fontWeight: 500,
               fontSize: "14px",
               transition: "all 0.2s"
             }}
           >
             Runtime Logs
           </button>
           <button 
             onClick={() => setActiveTab("build")}
             style={{
               padding: "8px 16px",
               background: activeTab === "build" ? "var(--text-primary)" : "transparent",
               color: activeTab === "build" ? "var(--bg-primary)" : "var(--text-secondary)",
               border: `1px solid ${activeTab === "build" ? "var(--text-primary)" : "var(--border-default)"}`,
               borderRadius: "var(--radius-md)",
               fontWeight: 500,
               fontSize: "14px",
               transition: "all 0.2s"
             }}
           >
             Build Logs
           </button>
        </div>
        <LogViewer logs={processedLogs} isLoading={refreshing && processedLogs.length === 0} />
      </div>

    </div>
  );
}

export default DeploymentDetails;

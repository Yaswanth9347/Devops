import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { RefreshCw, Filter, Rocket, FileText, Play } from "lucide-react";
import API from "../services/api";
import Button from "../components/ui/Button";
import DataTable from "../components/ui/DataTable";
import StatusBadge from "../components/StatusBadge";
import { useToastContext } from "../hooks/useToast";
import { getRequestErrorMessage } from "../utils/requestErrors";
import { formatDate } from "../utils/date";

function Deployments() {
  const navigate = useNavigate();
  const [deployments, setDeployments] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState("all");
  const { showToast } = useToastContext();

  const loadData = async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true);
    try {
      const [depRes, projRes] = await Promise.all([
        API.get("/deployments"),
        API.get("/projects")
      ]);
      if (depRes.data?.success) setDeployments(depRes.data.data || []);
      if (projRes.data?.success) setProjects(projRes.data.data || []);
    } catch (err) {
      showToast(getRequestErrorMessage(err, "Failed to load deployments."), "error");
    } finally {
      isRefresh ? setRefreshing(false) : setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleRetry = async (e, projectId) => {
    e.stopPropagation();
    try {
      const res = await API.post("/deployments", { project_id: projectId });
      if (res.data?.success) {
        showToast("Redeployment queued successfully.", "success");
        loadData(true);
      }
    } catch (err) {
      showToast("Redeployment failed to start.", "error");
    }
  };

  const projectMap = useMemo(() => {
    return projects.reduce((acc, p) => ({ ...acc, [p.id]: p.name }), {});
  }, [projects]);

  const filteredDeployments = useMemo(() => {
    return deployments
      .filter((dep) => filter === "all" || dep.status.toLowerCase() === filter)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [deployments, filter]);

  const columns = [
    {
      header: "Deploy ID",
      cell: (row) => (
        <span style={{ fontFamily: "var(--mono-family)", fontSize: "13px", color: "var(--text-secondary)" }}>
          #{row.id.toString().padStart(5, '0')}
        </span>
      )
    },
    {
      header: "Project",
      cell: (row) => (
        <div style={{ fontWeight: 500, color: "var(--text-primary)" }}>
          {projectMap[row.project_id] || `Project ${row.project_id}`}
        </div>
      )
    },
    {
      header: "Version",
      cell: (row) => (
        <span style={{ fontSize: "13px", color: "var(--text-secondary)", background: "var(--bg-hover)", padding: "2px 6px", borderRadius: "4px" }}>
          v{row.version}
        </span>
      )
    },
    {
      header: "Status",
      cell: (row) => <StatusBadge status={row.status} />
    },
    {
      header: "Created Time",
      cell: (row) => (
        <span style={{ color: "var(--text-secondary)", fontSize: "13px" }}>
          {row.created_at ? formatDate(row.created_at) : "Unknown"}
        </span>
      )
    },
    {
      header: "Actions",
      cell: (row) => (
        <div style={{ display: "flex", gap: "var(--space-2)" }} onClick={(e) => e.stopPropagation()}>
          <Button 
            size="sm" 
            variant="secondary"
            onClick={(e) => { e.stopPropagation(); navigate(`/deployments/${row.id}`); }}
            icon={FileText}
          >
            Logs
          </Button>
          {(row.status === "failed" || row.status === "stopped") && (
            <Button 
              size="sm" 
              variant="primary"
              onClick={(e) => handleRetry(e, row.project_id)}
              icon={RefreshCw}
            >
              Retry
            </Button>
          )}
        </div>
      )
    }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h1 style={{ marginBottom: "var(--space-1)" }}>Deployments</h1>
          <p style={{ color: "var(--text-secondary)", margin: 0 }}>Monitor and manage all deployment activities.</p>
        </div>
        <div style={{ display: "flex", gap: "var(--space-3)" }}>
          <Button variant="secondary" icon={RefreshCw} onClick={() => loadData(true)} isLoading={refreshing}>
            Refresh
          </Button>
          <Button variant="primary" icon={Play} onClick={() => navigate("/projects")}>
            Deploy Application
          </Button>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)", background: "var(--bg-secondary)", padding: "var(--space-3)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-default)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
           <Filter size={16} color="var(--text-tertiary)" />
           <span style={{ fontSize: "14px", color: "var(--text-secondary)", fontWeight: 500 }}>Filter Status:</span>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          {["all", "running", "building", "failed", "completed"].map((f) => (
             <button
               key={f}
               onClick={() => setFilter(f)}
               style={{
                 padding: "4px 12px",
                 borderRadius: "16px",
                 fontSize: "13px",
                 textTransform: "capitalize",
                 background: filter === f ? "var(--text-primary)" : "transparent",
                 color: filter === f ? "var(--bg-primary)" : "var(--text-secondary)",
                 border: `1px solid ${filter === f ? "var(--text-primary)" : "var(--border-default)"}`,
                 transition: "all 0.2s ease"
               }}
             >
               {f}
             </button>
          ))}
        </div>
        <div style={{ flex: 1 }} />
        <span style={{ color: "var(--text-tertiary)", fontSize: "13px" }}>
           Showing {filteredDeployments.length} {filter === "all" ? "total" : filter} deployments
        </span>
      </div>

      <DataTable 
        columns={columns}
        data={filteredDeployments}
        isLoading={loading}
        onRowClick={(row) => navigate(`/deployments/${row.id}`)}
        emptyMessage="No deployments found matching criteria."
      />
    </div>
  );
}

export default Deployments;

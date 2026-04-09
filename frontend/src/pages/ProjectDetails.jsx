import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Play, RefreshCw, Trash2, Edit2, ExternalLink, Layout, Clock, GitBranch } from "lucide-react";
import API from "../services/api";
import Button from "../components/ui/Button";
import DataTable from "../components/ui/DataTable";
import StatusBadge from "../components/StatusBadge";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import { useToastContext } from "../hooks/useToast";
import { getRequestErrorMessage } from "../utils/requestErrors";
import { formatDate, timeAgo } from "../utils/date";
import { shortenUrl } from "../utils/url";

function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [deployments, setDeployments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showDeployConfirm, setShowDeployConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editing, setEditing] = useState(false);
  const [projectName, setProjectName] = useState("");
  const { showToast } = useToastContext();

  const loadData = async () => {
    setLoading(true);
    try {
      // Fetch deployments first
      try {
        const depRes = await API.get("/deployments");
        if (depRes.data?.success) {
          setDeployments((depRes.data.data || []).filter(d => String(d.project_id) === String(id))
            .sort((a,b) => new Date(b.created_at) - new Date(a.created_at)));
        }
      } catch (e) {
        console.error("Failed deployments", e);
      }

      // Fetch project (directly from list to avoid 405 console errors)
      try {
        const listRes = await API.get("/projects");
        if (listRes.data?.success) {
          const found = (listRes.data.data || []).find(p => String(p.id) === String(id));
          if (found) setProject(found);
          else throw new Error("Project not found");
        } else {
          throw new Error("Unable to load project");
        }
      } catch (err) {
        throw new Error("Unable to load project");
      }
    } catch (err) {
      showToast(getRequestErrorMessage(err, "Failed to load project."), "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [id]);

  const handleDeploy = async () => {
    setShowDeployConfirm(false);
    setActionLoading(true);
    try {
      const res = await API.post("/deployments", { project_id: id });
      if (res.data?.success) {
        showToast("Deployment queued successfully.", "success");
        loadData();
      }
    } catch (err) {
      showToast("Deployment failed to start.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    setShowDeleteConfirm(false);
    setActionLoading(true);
    try {
      const res = await API.delete(`/projects/${id}`);
      if (res.data?.success) {
        showToast("Project deleted.", "success");
        navigate("/projects");
      }
    } catch (err) {
      showToast("Failed to delete project.", "error");
      setActionLoading(false);
    }
  };

  const updateProject = async (e) => {
    e.preventDefault();
    if (!projectName.trim()) return;
    
    setActionLoading(true);
    try {
      await API.put(`/projects/${id}`, { name: projectName.trim() });
      showToast("Project renamed.", "success");
      setEditing(false);
      loadData();
    } catch (err) {
      showToast("Failed to rename project.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading && !project) return <div style={{ display: "flex", justifyContent: "center", padding: "100px" }}>Loading...</div>;
  if (!project) return <div>Project not found</div>;

  const latestDeployment = deployments[0];

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
    }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      {/* Header */}
      <div>
        <Button variant="ghost" size="sm" onClick={() => navigate("/projects")} icon={ArrowLeft} style={{ marginBottom: "var(--space-2)", paddingLeft: 0 }}>
          Back to Projects
        </Button>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", marginBottom: "var(--space-1)" }}>
              <h1 style={{ margin: 0 }}>{project.name}</h1>
            </div>
            <p style={{ color: "var(--text-secondary)", margin: 0 }}>
              {project.description || "Project details and deployments."}
            </p>
          </div>
          <div style={{ display: "flex", gap: "var(--space-3)" }}>
            <Button variant="primary" icon={Play} onClick={() => setShowDeployConfirm(true)} isLoading={actionLoading}>
              Deploy
            </Button>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "var(--space-5)" }}>
        {/* Left Col */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
          <div className="card" style={{ padding: "var(--space-5)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-4)" }}>
              <h3 style={{ fontSize: "16px", margin: 0 }}>Project Info</h3>
              <Button size="sm" variant="ghost" icon={Edit2} onClick={() => { setEditing(!editing); setProjectName(project.name); }}>
                Edit
              </Button>
            </div>

            {editing && (
              <form onSubmit={updateProject} style={{ marginBottom: "var(--space-4)" }}>
                 <input 
                   autoFocus
                   value={projectName}
                   onChange={e => setProjectName(e.target.value)}
                   style={{ width: "100%", padding: "8px 12px", border: "1px solid var(--border-default)", borderRadius: "var(--radius-sm)", marginBottom: "var(--space-2)" }}
                 />
                 <div style={{ display: "flex", gap: "8px" }}>
                   <Button size="sm" variant="primary" onClick={updateProject}>Save</Button>
                   <Button size="sm" variant="secondary" onClick={() => setEditing(false)}>Cancel</Button>
                 </div>
              </form>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
               <div>
                  <p style={{ margin: "0 0 2px", fontSize: "13px", color: "var(--text-secondary)" }}>Repository</p>
                  {project.repo_url ? (
                    <a href={project.repo_url} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "14px", color: "var(--primary-color)" }}>
                      <ExternalLink size={14} /> {shortenUrl(project.repo_url)}
                    </a>
                  ) : <span style={{ fontSize: "14px", color: "var(--text-tertiary)" }}>Not configured</span>}
               </div>
               <div>
                  <p style={{ margin: "0 0 2px", fontSize: "13px", color: "var(--text-secondary)" }}>Branch</p>
                  <p style={{ margin: 0, fontSize: "14px", display: "flex", alignItems: "center", gap: "6px" }}><GitBranch size={14} /> {project.branch || "main"}</p>
               </div>
               <div>
                  <p style={{ margin: "0 0 2px", fontSize: "13px", color: "var(--text-secondary)" }}>Created</p>
                  <p style={{ margin: 0, fontSize: "14px", display: "flex", alignItems: "center", gap: "6px" }}><Clock size={14} /> {formatDate(project.created_at)}</p>
               </div>
               <div>
                  <p style={{ margin: "0 0 2px", fontSize: "13px", color: "var(--text-secondary)" }}>Latest Status</p>
                  {latestDeployment ? <StatusBadge status={latestDeployment.status} /> : <span style={{ fontSize: "14px", color: "var(--text-tertiary)" }}>No deployments</span>}
               </div>
            </div>
          </div>

          <div className="card" style={{ padding: "var(--space-5)", background: "var(--error-bg)", borderColor: "var(--error-border)" }}>
             <h3 style={{ fontSize: "16px", color: "var(--error-color)", margin: "0 0 var(--space-2)" }}>Danger Zone</h3>
             <p style={{ fontSize: "13px", color: "#7F1D1D", margin: "0 0 var(--space-4)" }}>Deleting a project permanently removes all associated deployments.</p>
             <Button variant="danger" icon={Trash2} onClick={() => setShowDeleteConfirm(true)}>Delete Project</Button>
          </div>
        </div>

        {/* Right Col */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ fontSize: "18px", margin: 0 }}>Deployments</h2>
            <span style={{ fontSize: "14px", color: "var(--text-secondary)" }}>{deployments.length} Total</span>
          </div>
          <DataTable 
            columns={columns}
            data={deployments}
            onRowClick={(row) => navigate(`/deployments/${row.id}`)}
            emptyMessage="No deployments for this project yet."
          />
        </div>
      </div>

      {showDeployConfirm && (
        <ConfirmDialog
          title="Start Deployment"
          message={`Deploy the latest ${project.branch || 'main'} branch of ${project.name}?`}
          confirmLabel="Deploy"
          cancelLabel="Cancel"
          onConfirm={handleDeploy}
          onCancel={() => setShowDeployConfirm(false)}
        />
      )}

      {showDeleteConfirm && (
        <ConfirmDialog
          title="Delete Project"
          message={`Are you sure you want to delete ${project.name}? This action cannot be reversed.`}
          confirmLabel="Delete Permanently"
          cancelLabel="Cancel"
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteConfirm(false)}
          danger
        />
      )}
    </div>
  );
}

export default ProjectDetails;

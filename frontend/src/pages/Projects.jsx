import React, { useEffect, useState } from "react";
import { Search, Plus, ExternalLink, GitBranch, FolderGit2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import ProjectForm from "../components/ProjectForm";
import Button from "../components/ui/Button";
import DataTable from "../components/ui/DataTable";
import { useToastContext } from "../hooks/useToast";
import { getRequestErrorMessage } from "../utils/requestErrors";
import { shortenUrl } from "../utils/url";
import { formatDate } from "../utils/date";

function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [deployingId, setDeployingId] = useState(null);
  const { showToast } = useToastContext();
  const navigate = useNavigate();

  const loadProjects = () => {
    setLoading(true);
    API.get("/projects")
      .then(res => {
        if (res.data?.success) setProjects(res.data.data || []);
      })
      .catch((err) => showToast(getRequestErrorMessage(err, "Failed to load projects."), "error"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadProjects(); }, []);

  const handleDeploy = async (e, projectId) => {
    e.stopPropagation();
    setDeployingId(projectId);
    try {
      const res = await API.post("/deployments", { project_id: projectId });
      if (res.data?.success) {
        showToast("Deployment queued successfully.", "success");
      }
    } catch (err) {
      showToast("Deployment failed to start.", "error");
    } finally {
      setDeployingId(null);
    }
  };

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    (p.description && p.description.toLowerCase().includes(search.toLowerCase()))
  );

  const columns = [
    {
      header: "Project",
      cell: (row) => (
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "var(--radius-md)", background: "var(--bg-hover)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)" }}>
            <FolderGit2 size={18} />
          </div>
          <div>
            <div style={{ fontWeight: 500, color: "var(--text-primary)", fontSize: "14px" }}>{row.name}</div>
            <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>{row.description || "No description"}</div>
          </div>
        </div>
      )
    },
    {
      header: "Repository",
      cell: (row) => (
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px" }}>
            <GitBranch size={14} color="var(--text-tertiary)" />
            <span style={{ color: "var(--text-secondary)" }}>{row.branch || "main"}</span>
          </div>
          {row.repo_url && (
            <a 
              href={row.repo_url} 
              target="_blank" 
              rel="noreferrer" 
              onClick={(e) => e.stopPropagation()}
              style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "13px", color: "var(--primary-color)" }}
            >
              <ExternalLink size={12} /> {shortenUrl(row.repo_url)}
            </a>
          )}
        </div>
      )
    },
    {
      header: "Created",
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
            onClick={(e) => { e.stopPropagation(); navigate(`/projects/${row.id}`); }}
          >
            Settings
          </Button>
          <Button 
            size="sm" 
            variant="primary"
            isLoading={deployingId === row.id}
            onClick={(e) => handleDeploy(e, row.id)}
          >
            Deploy
          </Button>
        </div>
      )
    }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
      {showForm && (
        <div style={{ marginBottom: "var(--space-4)" }}>
          <ProjectForm 
            onCreated={() => { loadProjects(); setShowForm(false); showToast("Project created", "success"); }}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h1 style={{ marginBottom: "var(--space-1)" }}>Projects</h1>
          <p style={{ color: "var(--text-secondary)", margin: 0 }}>Manage your deployment projects and environments.</p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "Create Project"}
        </Button>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)" }}>
         <div style={{ position: "relative", width: "320px" }}>
           <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-tertiary)" }} />
           <input 
             type="text"
             placeholder="Search projects..."
             value={search}
             onChange={(e) => setSearch(e.target.value)}
             style={{
               width: "100%",
               padding: "10px 12px 10px 36px",
               background: "var(--bg-secondary)",
               border: "1px solid var(--border-default)",
               borderRadius: "var(--radius-md)",
               fontSize: "14px",
               color: "var(--text-primary)",
               outline: "none",
               transition: "border-color 0.15s ease"
             }}
             onFocus={(e) => e.target.style.borderColor = "var(--primary-color)"}
             onBlur={(e) => e.target.style.borderColor = "var(--border-default)"}
           />
         </div>
         <span style={{ color: "var(--text-secondary)", fontSize: "13px" }}>
           {filteredProjects.length} projects found
         </span>
      </div>

      <DataTable 
        columns={columns}
        data={filteredProjects}
        isLoading={loading}
        onRowClick={(row) => navigate(`/projects/${row.id}`)}
        emptyMessage={search ? "No projects found matching your search." : "No projects created yet."}
      />
    </div>
  );
}

export default Projects;

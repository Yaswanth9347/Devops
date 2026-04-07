import { useEffect, useState } from "react";
import API from "../services/api";
import ProjectCard from "../components/ProjectCard";
import ProjectForm from "../components/ProjectForm";
import Alert from "../components/Alert";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";
import PageContainer from "../components/PageContainer";

function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const loadProjects = () => {
    setLoading(true);
    setError(null);
    API.get("/projects")
      .then(res => {
        if (res.data && res.data.success) setProjects(res.data.data);
      })
      .catch(() => setError("Failed to load projects. Is the backend running?"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadProjects(); }, []);

  const addButton = (
    <button
      onClick={() => setShowForm(!showForm)}
      style={{
        padding: "8px 18px",
        background: showForm ? "#e74c3c" : "#1abc9c",
        color: "white", border: "none", borderRadius: "6px", cursor: "pointer",
        fontWeight: "600"
      }}
    >
      {showForm ? "✕ Cancel" : "+ Add Project"}
    </button>
  );

  return (
    <PageContainer title="Projects" subtitle="Manage your deployment projects" actions={addButton}>
      {message && <Alert message={message} type="success" onDismiss={() => setMessage(null)} />}
      {error && <Alert message={error} type="error" onDismiss={() => setError(null)} />}

      {showForm && (
        <ProjectForm
          onCreated={() => { loadProjects(); setShowForm(false); setMessage("✅ Project created successfully!"); }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {loading && <Loader text="Loading projects..." />}

      {!loading && !error && projects.length === 0 && (
        <EmptyState icon="📁" title="No Projects Yet" message="Click '+ Add Project' above to create your first project." />
      )}

      {!loading && projects.map(p => (
        <ProjectCard key={p.id} project={p} onDeployStarted={() => setMessage("🚀 Deployment started! Check the Deployments page.")} />
      ))}
    </PageContainer>
  );
}

export default Projects;

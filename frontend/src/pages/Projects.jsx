import { useEffect, useState } from "react";
import API from "../services/api";
import ProjectCard from "../components/ProjectCard";
import ProjectForm from "../components/ProjectForm";
import PageContainer from "../components/PageContainer";
import { useToastContext } from "../hooks/useToast";
import Button from "../components/ui/Button";
import Section from "../components/ui/Section";
import EmptyState from "../components/ui/EmptyState";
import PageState from "../components/ui/PageState";
import { spacing } from "../utils/theme";
import { getRequestErrorMessage } from "../utils/requestErrors";

function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const { showToast } = useToastContext();
  const itemsPerPage = 5;

  const filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(filteredProjects.length / itemsPerPage));
  const start = (page - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const paginatedProjects = filteredProjects.slice(start, end);

  const loadProjects = () => {
    setLoading(true);
    setError(null);
    API.get("/projects")
      .then(res => {
        if (!res.data || !res.data.success || !Array.isArray(res.data.data)) {
          throw new Error("invalid_projects_response");
        }
        setProjects(res.data.data);
        setError(null);
      })
      .catch((err) => {
        const message = err?.message === "invalid_projects_response"
          ? "Invalid server response while loading projects."
          : getRequestErrorMessage(err, "Failed to load projects.");
        setError(message);
        showToast(message, "error");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadProjects(); }, []);

  useEffect(() => {
    setPage(1);
  }, [search]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const addButton = (
    <Button
      onClick={() => setShowForm(!showForm)}
      variant={showForm ? "muted" : "primary"}
      style={{
        padding: "8px 18px",
        borderRadius: "6px"
      }}
    >
      {showForm ? "Close Form" : "+ Create Project"}
    </Button>
  );

  return (
    <PageContainer title="Projects" subtitle="Manage your deployment projects" actions={addButton}>
      <Section>
        {showForm && (
          <ProjectForm
            onCreated={() => {
              loadProjects();
              setShowForm(false);
              showToast("Project created successfully.", "success");
            }}
            onCancel={() => setShowForm(false)}
          />
        )}

        <PageState
          loading={loading}
          error={error}
          loadingText="Loading projects..."
          onRetry={loadProjects}
          retryLabel="Retry Loading"
        >
          {projects.length > 0 && (
          <div style={{ marginBottom: "20px", display: "flex", alignItems: "flex-end", gap: spacing.buttonGap, flexWrap: "wrap" }}>
            <div style={{ display: "grid", gap: "6px" }}>
              <label htmlFor="project-search" style={{ color: "#374151", fontSize: "0.84em", fontWeight: 600 }}>
                Search Projects
              </label>
              <input
                id="project-search"
                placeholder="Search projects..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={(event) => {
                  event.currentTarget.style.borderColor = "#1976d2";
                  event.currentTarget.style.boxShadow = "0 0 0 2px rgba(25,118,210,0.12)";
                }}
                onBlur={(event) => {
                  event.currentTarget.style.borderColor = "#d7dee5";
                  event.currentTarget.style.boxShadow = "none";
                }}
                style={{
                  padding: "8px 10px",
                  width: "250px",
                  border: "1px solid #d7dee5",
                  borderRadius: "6px",
                  fontSize: "0.9em",
                  transition: "border-color 0.15s ease, box-shadow 0.15s ease",
                  outline: "none"
                }}
              />
              <small style={{ color: "#6b7280", fontSize: "0.76em" }}>Type a project name to filter the list.</small>
            </div>
            <span style={{ color: "#6b7280", fontSize: "0.85em" }}>
              Showing {filteredProjects.length} of {projects.length} projects
            </span>
          </div>
          )}

          {projects.length === 0 && (
          <EmptyState
            icon="📁"
            title="No Projects Yet"
            message="Create your first project to start deploying applications."
            action={(
              <Button onClick={() => setShowForm(true)} variant="primary">
                Create Project
              </Button>
            )}
          />
          )}

          {projects.length > 0 && filteredProjects.length === 0 && (
          <EmptyState
            icon="🔎"
            title="No Matching Projects"
            message="Try adjusting your search to find projects."
            action={(
              <Button onClick={() => setSearch("")} variant="muted">
                Clear Search
              </Button>
            )}
          />
          )}

          {paginatedProjects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onDeployStarted={() => showToast("Deployment started. Check the Deployments page.", "info")}
          />
          ))}

          {filteredProjects.length > 0 && (
          <div style={{ marginTop: "16px", display: "flex", alignItems: "center", gap: spacing.buttonGap }}>
            <Button
              variant={page === 1 ? "muted" : "info"}
              disabled={page === 1}
              onClick={() => setPage((current) => current - 1)}
            >
              Previous
            </Button>

            <span style={{ color: "#555", fontSize: "0.88em" }}>Page {page} of {totalPages}</span>

            <Button
              variant={page === totalPages ? "muted" : "info"}
              disabled={page === totalPages}
              onClick={() => setPage((current) => current + 1)}
            >
              Next
            </Button>
          </div>
          )}
        </PageState>
      </Section>
    </PageContainer>
  );
}

export default Projects;

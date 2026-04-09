import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import API from "../services/api";
import Loader from "../components/Loader";
import PageContainer from "../components/PageContainer";
import DeploymentCard from "../components/DeploymentCard";
import StatusBadge from "../components/StatusBadge";
import { useToastContext } from "../hooks/useToast";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Section from "../components/ui/Section";
import Breadcrumb from "../components/ui/Breadcrumb";
import ErrorMessage from "../components/ui/ErrorMessage";
import EmptyState from "../components/ui/EmptyState";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import { spacing } from "../utils/theme";
import { getRequestErrorMessage } from "../utils/requestErrors";
import { formatDate, timeAgo } from "../utils/date";
import { shortenUrl, shortId } from "../utils/url";

function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [deployments, setDeployments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionType, setActionType] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [copyingRepo, setCopyingRepo] = useState(false);
  const [copyingUrlById, setCopyingUrlById] = useState({});
  const [editing, setEditing] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [updatingProject, setUpdatingProject] = useState(false);
  const [editNameError, setEditNameError] = useState("");
  const [showDeployConfirm, setShowDeployConfirm] = useState(false);
  const [showRedeployConfirm, setShowRedeployConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { showToast } = useToastContext();

  const latestDeployment = useMemo(() => {
    if (!deployments.length) return null;
    return deployments[0];
  }, [deployments]);

  const loadProject = async () => {
    try {
      const byIdRes = await API.get(`/projects/${id}`);
      if (byIdRes.data?.success && byIdRes.data?.data) {
        setProject(byIdRes.data.data);
        return;
      }

      if (byIdRes.data && byIdRes.data.id) {
        setProject(byIdRes.data);
        return;
      }
    } catch (err) {
      if (err?.response?.status !== 404) {
        throw new Error(getRequestErrorMessage(err, "Unable to load project details."));
      }
    }

    const listRes = await API.get("/projects");
    if (!listRes.data || !listRes.data.success || !Array.isArray(listRes.data.data)) {
      throw new Error("Invalid server response while loading project details.");
    }
    const allProjects = listRes.data?.data || [];
    const found = allProjects.find((p) => String(p.id) === String(id));
    if (!found) {
      throw new Error("Project not found.");
    }
    setProject(found);
  };

  const loadDeployments = async () => {
    try {
      const res = await API.get(`/projects/${id}/deployments`);
      if (res.data?.success) {
        if (!Array.isArray(res.data.data)) {
          throw new Error("Invalid server response while loading project deployments.");
        }
        setDeployments(res.data.data || []);
        return;
      }

      if (Array.isArray(res.data)) {
        setDeployments(res.data);
        return;
      }
    } catch (err) {
      if (err?.message?.includes("Invalid server response")) {
        throw err;
      }
    }

    const globalRes = await API.get("/deployments");
    if (!globalRes.data || !globalRes.data.success || !Array.isArray(globalRes.data.data)) {
      throw new Error("Invalid server response while loading project deployments.");
    }
    const allDeployments = globalRes.data?.data || [];
    setDeployments(allDeployments.filter((d) => String(d.project_id) === String(id)));
  };

  const loadAll = async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([loadProject(), loadDeployments()]);
    } catch (err) {
      const message = err?.message || "Unable to connect to server while loading project details.";
      setError(message);
      showToast(message, "error");
    } finally {
      setLoading(false);
    }
  };

  const runAction = async (type, actionFn) => {
    setActionType(type);
    setActionLoading(true);
    setActionError(null);
    try {
      await actionFn();
    } catch (err) {
      const actionErrorMap = {
        deploy: "Deployment failed to start.",
        redeploy: "Redeployment failed to start.",
        refresh: "Failed to refresh deployments.",
        delete: "Unable to delete project."
      };
      const message = actionErrorMap[type] || err?.message || "Action failed. Please try again.";
      setActionError(message);
      showToast(message, "error");
    } finally {
      setActionLoading(false);
      setActionType(null);
    }
  };

  const handleDeploy = () => {
    if (!project) return;
    setShowDeployConfirm(false);
    runAction("deploy", async () => {
      const res = await API.post("/deployments", { project_id: project.id });
      if (res.data?.success) {
        showToast("Deployment queued.", "info");
        await loadDeployments();
        return;
      }
      throw new Error("deploy_failed");
    });
  };

  const handleRedeploy = () => {
    if (!project) return;
    setShowRedeployConfirm(false);
    runAction("redeploy", async () => {
      if (latestDeployment?.id) {
        const res = await API.post(`/deployments/${latestDeployment.id}/redeploy`);
        if (!res.data?.success) throw new Error("redeploy_failed");
      } else {
        const res = await API.post("/deployments", { project_id: project.id });
        if (!res.data?.success) throw new Error("deploy_failed");
      }

      showToast("Redeployment queued.", "info");
      await loadDeployments();
    });
  };

  const handleDeleteProject = () => {
    runAction("delete", async () => {
      const res = await API.delete(`/projects/${id}`);
      if (!res.data?.success) throw new Error("delete_failed");
      showToast("Project deleted successfully.", "success");
      setShowDeleteConfirm(false);
      setTimeout(() => navigate("/projects"), 250);
    });
  };

  const cancelDeleteProject = () => {
    setShowDeleteConfirm(false);
    setActionError(null);
  };

  const cancelDeployConfirm = () => {
    setShowDeployConfirm(false);
    setActionError(null);
  };

  const cancelRedeployConfirm = () => {
    setShowRedeployConfirm(false);
    setActionError(null);
  };

  const handleRefreshDeployments = () => {
    runAction("refresh", async () => {
      await loadDeployments();
      showToast("Deployments refreshed.", "info");
    });
  };

  const copyProjectRepo = async () => {
    if (!project?.repo_url) return;

    setCopyingRepo(true);
    try {
      await navigator.clipboard.writeText(project.repo_url);
      showToast("Repository URL copied.", "success");
    } catch {
      showToast("Unable to copy repository URL.", "error");
    } finally {
      setCopyingRepo(false);
    }
  };

  const copyDeploymentUrl = async (deploymentId, url) => {
    if (!url) return;

    setCopyingUrlById((prev) => ({ ...prev, [deploymentId]: true }));
    try {
      await navigator.clipboard.writeText(url);
      showToast("Deployment URL copied.", "success");
    } catch {
      showToast("Unable to copy deployment URL.", "error");
    } finally {
      setCopyingUrlById((prev) => ({ ...prev, [deploymentId]: false }));
    }
  };

  const startEdit = () => {
    setProjectName(project?.name || "");
    setEditNameError("");
    setEditing(true);
  };

  const cancelEdit = () => {
    setEditing(false);
    setProjectName(project?.name || "");
    setEditNameError("");
  };

  const updateProject = async (event) => {
    if (event) event.preventDefault();

    const trimmedName = projectName.trim();
    if (!trimmedName) {
      setEditNameError("Project name is required.");
      showToast("Project name cannot be empty.", "error");
      return;
    }

    setEditNameError("");
    setUpdatingProject(true);
    try {
      const res = await API.put(`/projects/${id}`, { name: trimmedName });
      const success = res.data?.success !== false;

      if (!success) {
        throw new Error("Unable to update project.");
      }

      setProject((prev) => ({ ...prev, name: trimmedName }));
      setEditing(false);
      showToast("Project updated.", "success");
      await loadProject();
    } catch (err) {
      showToast(getRequestErrorMessage(err, "Unable to update project. Backend may not support project updates yet."), "error");
    } finally {
      setUpdatingProject(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, [id]);

  if (loading) return <Loader text="Loading project details..." />;

  if (error) {
    return (
      <PageContainer
        title="Project Details"
        subtitle="Load failed"
        actions={<Button onClick={() => navigate(-1)} variant="muted">← Back</Button>}
      >
        <ErrorMessage message={error} onRetry={loadAll} retryLabel="Retry Loading" />
      </PageContainer>
    );
  }

  if (!project) {
    return (
      <PageContainer title="Project Details" subtitle="Not available">
        <ErrorMessage message="Project not found." onRetry={loadAll} retryLabel="Retry Loading" />
      </PageContainer>
    );
  }

  const headerActions = (
    <div style={{ display: "flex", gap: spacing.buttonGap, flexWrap: "wrap" }}>
      <Button onClick={() => navigate(-1)} variant="muted" style={{ padding: "8px 16px" }}>
        ← Back
      </Button>
    </div>
  );

  return (
    <PageContainer
      title={project.name}
      subtitle={project.repo_url || project.description || "Project details and deployment history"}
      actions={headerActions}
    >
      <Breadcrumb
        items={[
          { label: "Projects", link: "/projects" },
          { label: project.name }
        ]}
      />

      <Section title="Project Information">
        <Card style={{ padding: "18px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
          <p style={{ margin: "0 0 10px", color: "#555" }}><strong>Name:</strong> {project.name}</p>
          <p style={{ margin: "0 0 10px", color: "#555" }}><strong>Project ID:</strong> #{shortId(project.id)}</p>
          <p style={{ margin: "0 0 10px", color: "#555", display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
            <strong>Repository:</strong>{" "}
            {project.repo_url ? (
              <>
                <a href={project.repo_url} target="_blank" rel="noreferrer" title={project.repo_url} style={{ color: "#3498db" }}>
                  {shortenUrl(project.repo_url)}
                </a>
                <Button
                  onClick={copyProjectRepo}
                  loading={copyingRepo}
                  loadingText="Copying..."
                  disabled={copyingRepo}
                  variant="muted"
                  style={{ padding: "4px 10px", fontSize: "0.75em" }}
                >
                  Copy URL
                </Button>
                <a
                  href={project.repo_url}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: "#1a1d2e", fontSize: "0.82em", fontWeight: 600 }}
                >
                  Open Repository ↗
                </a>
              </>
            ) : (
              "Not configured"
            )}
          </p>
          <p style={{ margin: "0 0 10px", color: "#555" }}><strong>Branch:</strong> {project.branch || "main"}</p>
          <p style={{ margin: "0 0 10px", color: "#555" }}><strong>Created:</strong> {formatDate(project.created_at)}</p>
          <p style={{ margin: "0 0 10px", color: "#555" }}><strong>Total Deployments:</strong> {deployments.length}</p>
          <p style={{ margin: 0, color: "#555" }}>
            <strong>Last Deployment Status:</strong>{" "}
            {latestDeployment ? <StatusBadge status={latestDeployment.status} /> : "No deployments yet"}
          </p>

          <div style={{ marginTop: "14px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {!editing ? (
              <Button onClick={startEdit} variant="primary" style={{ padding: "7px 12px" }}>
                Edit Project
              </Button>
            ) : null}
          </div>

          {editing && (
            <Card style={{ marginTop: "12px", marginBottom: 0, padding: "14px", background: "#f8fafc", borderColor: "#e2e8f0" }}>
              <form onSubmit={updateProject}>
                <p style={{ margin: "0 0 8px", color: "#374151", fontSize: "0.88em", fontWeight: 600 }}>Edit Project Name</p>
                <div style={{ marginBottom: "12px" }}>
                  <label htmlFor="edit-project-name" style={{ display: "block", marginBottom: "6px", color: "#374151", fontSize: "0.84em", fontWeight: 600 }}>
                    Project Name
                  </label>
                  <input
                    id="edit-project-name"
                    type="text"
                    value={projectName}
                    onChange={(event) => {
                      setProjectName(event.target.value);
                      if (editNameError) setEditNameError("");
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Escape") {
                        event.preventDefault();
                        cancelEdit();
                      }
                    }}
                    onFocus={(event) => {
                      event.currentTarget.style.borderColor = "#1976d2";
                      event.currentTarget.style.boxShadow = "0 0 0 2px rgba(25,118,210,0.12)";
                    }}
                    onBlur={(event) => {
                      const nextError = event.target.value.trim() ? "" : "Project name is required.";
                      setEditNameError(nextError);
                      event.currentTarget.style.borderColor = nextError ? "#d32f2f" : "#d1d5db";
                      event.currentTarget.style.boxShadow = "none";
                    }}
                    placeholder="Project name"
                    aria-invalid={Boolean(editNameError)}
                    style={{
                      width: "100%",
                      padding: "9px 10px",
                      border: `1px solid ${editNameError ? "#d32f2f" : "#d1d5db"}`,
                      borderRadius: "6px",
                      fontSize: "0.9em",
                      transition: "border-color 0.15s ease, box-shadow 0.15s ease",
                      outline: "none"
                    }}
                  />
                  <small style={{ color: "#6b7280", fontSize: "0.76em", display: "block", marginTop: "5px" }}>
                    Press Enter to save or Esc to cancel editing.
                  </small>
                  {editNameError && <small style={{ color: "#d32f2f", fontSize: "0.78em", display: "block", marginTop: "5px" }}>{editNameError}</small>}
                </div>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  <Button
                    htmlType="submit"
                    loading={updatingProject}
                    loadingText="Saving..."
                    disabled={updatingProject || !projectName.trim()}
                    variant={updatingProject ? "muted" : "primary"}
                  >
                    Save Project Name
                  </Button>
                  <Button onClick={cancelEdit} disabled={updatingProject} variant="muted">
                    Cancel Edit
                  </Button>
                </div>
              </form>
            </Card>
          )}
        </Card>
      </Section>

      <Section title="Deployments">
        <Card style={{ padding: "18px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
          {deployments.length === 0 ? (
            <EmptyState
              icon="🚀"
              title="No Deployments Yet"
              message="Click deploy to create your first deployment for this project."
              action={(
                <Button
                  onClick={() => setShowDeployConfirm(true)}
                  loading={actionLoading && actionType === "deploy"}
                  loadingText="Deploying..."
                  disabled={actionLoading}
                  variant={actionLoading && actionType === "deploy" ? "muted" : "primary"}
                >
                  Deploy
                </Button>
              )}
            />
          ) : (
            <>
              <div style={{ marginBottom: "12px", border: "1px solid #eef1f4", borderRadius: "6px", overflow: "hidden" }}>
                <div style={{ display: "grid", gridTemplateColumns: "0.8fr 0.8fr 1fr 1fr", background: "#f8fafc", padding: "10px 12px", fontWeight: "600", color: "#4b5563", fontSize: "0.85em" }}>
                  <span>ID</span>
                  <span>Status</span>
                  <span>Created</span>
                  <span>URL</span>
                </div>
                {deployments.slice(0, 5).map((dep) => (
                  <Link
                    key={`summary-${dep.id}`}
                    to={`/deployments/${dep.id}`}
                    style={{ display: "grid", gridTemplateColumns: "0.8fr 0.8fr 1fr 1fr", padding: "10px 12px", textDecoration: "none", color: "inherit", borderTop: "1px solid #eef1f4", fontSize: "0.88em", alignItems: "center", gap: "8px" }}
                  >
                    <span><strong>{shortId(dep.id)}</strong></span>
                    <span><StatusBadge status={dep.status} /></span>
                    <span style={{ color: "#666" }}>{timeAgo(dep.created_at)} ({formatDate(dep.created_at)})</span>
                    <span
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                      }}
                      style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}
                    >
                      {dep.url ? (
                        <>
                          <a
                            href={dep.url}
                            target="_blank"
                            rel="noreferrer"
                            title={dep.url}
                            onClick={(event) => event.stopPropagation()}
                            style={{ color: "#3498db" }}
                          >
                            {shortenUrl(dep.url, 28)}
                          </a>
                          <Button
                            onClick={(event) => {
                              event.preventDefault();
                              event.stopPropagation();
                              copyDeploymentUrl(dep.id, dep.url);
                            }}
                            loading={Boolean(copyingUrlById[dep.id])}
                            loadingText="Copying..."
                            disabled={Boolean(copyingUrlById[dep.id])}
                            variant="muted"
                            style={{ padding: "3px 8px", fontSize: "0.72em" }}
                          >
                            Copy
                          </Button>
                        </>
                      ) : (
                        <span style={{ color: "#aaa" }}>—</span>
                      )}
                    </span>
                  </Link>
                ))}
              </div>

              <h4 style={{ margin: "0 0 10px", color: "#1a1d2e" }}>Deployment History</h4>
              {deployments.map((dep) => (
                <DeploymentCard key={dep.id} deployment={dep} onActionComplete={loadDeployments} />
              ))}
            </>
          )}
        </Card>
      </Section>

      <Section title="Environment Variables">
        <Card style={{ padding: "18px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
          <EmptyState
            icon="🧩"
            title="No Environment Variables Yet"
            message="Environment variables will appear here when configured."
          />
        </Card>
      </Section>

      <Section title="Settings">
        <Card style={{ padding: "18px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
          {actionError && (
            <div style={{ marginBottom: "10px" }}>
              <ErrorMessage message={actionError} />
            </div>
          )}
          <p style={{ margin: "0 0 10px", color: "#4b5563", fontSize: "0.9em" }}>
            Manage deployment operations and project runtime actions.
          </p>
          <div style={{ display: "flex", gap: spacing.buttonGap, flexWrap: "wrap", marginTop: "10px" }}>
            <Button
              onClick={() => setShowDeployConfirm(true)}
              loading={actionLoading && actionType === "deploy"}
              loadingText="Deploying..."
              disabled={actionLoading}
              variant={actionLoading && actionType === "deploy" ? "muted" : "primary"}
              style={{ padding: "8px 14px" }}
            >
              🚀 Deploy
            </Button>

            <Button
              onClick={() => setShowRedeployConfirm(true)}
              loading={actionLoading && actionType === "redeploy"}
              loadingText="Redeploying..."
              disabled={actionLoading}
              variant={actionLoading && actionType === "redeploy" ? "muted" : "info"}
              style={{ padding: "8px 14px" }}
            >
              🔁 Redeploy
            </Button>

            <Button
              onClick={handleRefreshDeployments}
              loading={actionLoading && actionType === "refresh"}
              loadingText="Refreshing..."
              disabled={actionLoading}
              variant={actionLoading && actionType === "refresh" ? "muted" : "muted"}
              style={{ padding: "8px 14px" }}
            >
              🔄 Refresh
            </Button>
          </div>
        </Card>
      </Section>

      <Section title="Danger Zone" titleStyle={{ color: "#d32f2f" }}>
        <Card style={{ padding: "18px 20px", borderColor: "#f4cccc", background: "#fff7f7", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
          <p style={{ margin: "0 0 12px", color: "#8a4040", fontSize: "0.88em" }}>
            Deleting a project removes all associated deployments from this platform.
          </p>
          <Button
            onClick={() => setShowDeleteConfirm(true)}
            loading={false}
            loadingText="Deleting..."
            disabled={actionLoading}
            variant="danger"
            style={{ padding: "7px 12px", borderRadius: "5px" }}
          >
            Delete Project Permanently
          </Button>
        </Card>
      </Section>

      {showDeleteConfirm && (
        <ConfirmDialog
          title="Delete Project Permanently"
          message="This action cannot be undone. All related deployment records for this project will be removed from this platform."
          confirmLabel="Delete Permanently"
          cancelLabel="Cancel"
          onConfirm={handleDeleteProject}
          onCancel={cancelDeleteProject}
          confirming={actionLoading && actionType === "delete"}
          danger
        />
      )}

      {showDeployConfirm && (
        <ConfirmDialog
          title="Start Deployment"
          message={`Start deployment for \"${project.name}\"?`}
          confirmLabel="Start Deployment"
          cancelLabel="Cancel"
          onConfirm={handleDeploy}
          onCancel={cancelDeployConfirm}
          confirming={actionLoading && actionType === "deploy"}
        />
      )}

      {showRedeployConfirm && (
        <ConfirmDialog
          title="Start Redeployment"
          message="Start a redeployment for this project?"
          confirmLabel="Start Redeploy"
          cancelLabel="Cancel"
          onConfirm={handleRedeploy}
          onCancel={cancelRedeployConfirm}
          confirming={actionLoading && actionType === "redeploy"}
        />
      )}
    </PageContainer>
  );
}

export default ProjectDetails;

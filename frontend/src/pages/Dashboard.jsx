import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import PageContainer from "../components/PageContainer";
import Section from "../components/ui/Section";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import EmptyState from "../components/ui/EmptyState";
import StatCard from "../components/ui/StatCard";
import DeploymentCard from "../components/DeploymentCard";
import ActivityItem from "../components/ui/ActivityItem";
import PageState from "../components/ui/PageState";
import { useToastContext } from "../hooks/useToast";
import { colors } from "../utils/theme";
import { getRequestErrorMessage } from "../utils/requestErrors";
import { formatDate, timeAgo } from "../utils/date";

function Dashboard() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [deployments, setDeployments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [error, setError] = useState(null);
  const { showToast } = useToastContext();

  const totalProjects = projects.length;
  const totalDeployments = deployments.length;
  const runningDeployments = deployments.filter((deployment) => deployment.status === "running").length;
  const failedDeployments = deployments.filter((deployment) => deployment.status === "failed").length;
  const buildingDeployments = deployments.filter((deployment) => ["building", "deploying", "pending", "cloning"].includes(deployment.status)).length;
  const successDeployments = deployments.filter((deployment) => ["running", "completed", "success"].includes(deployment.status)).length;
  const health = failedDeployments > 0 ? "Attention Needed" : "Healthy";
  const successRate = totalDeployments > 0 ? Math.round((runningDeployments / totalDeployments) * 100) : 0;

  const projectNameById = useMemo(() => {
    return projects.reduce((accumulator, project) => {
      accumulator[String(project.id)] = project.name;
      return accumulator;
    }, {});
  }, [projects]);

  const recentFailures = useMemo(() => {
    return [...deployments]
      .filter((deployment) => deployment.status === "failed" || deployment.build_status === "failed")
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 3);
  }, [deployments]);

  const recentSuccesses = useMemo(() => {
    return [...deployments]
      .filter((deployment) => ["running", "completed", "success"].includes(deployment.status))
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 3);
  }, [deployments]);

  const recentDeployments = useMemo(() => {
    return [...deployments]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5);
  }, [deployments]);

  const recentActivities = useMemo(() => {
    const activities = [];

    projects.forEach((project) => {
      activities.push({
        type: "project",
        message: `Project ${project.name} was created`,
        date: project.created_at
      });
    });

    deployments.forEach((deployment) => {
      const projectName = projectNameById[String(deployment.project_id)] || `Project #${deployment.project_id}`;

      activities.push({
        type: "deployment",
        message: `Deployment v${deployment.version} is ${deployment.status} for ${projectName}`,
        date: deployment.created_at
      });

      activities.push({
        type: "operation",
        message: `Operation recorded for ${projectName}`,
        date: deployment.created_at
      });

      if (deployment.status === "failed" || deployment.build_status === "failed") {
        activities.push({
          type: "failure",
          message: `Deployment v${deployment.version} failed for ${projectName}`,
          date: deployment.created_at
        });
      }
    });

    return activities
      .filter((activity) => Boolean(activity.date))
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 8);
  }, [projects, deployments, projectNameById]);

  const loadDashboard = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const [projectsRes, deploymentsRes] = await Promise.all([
        API.get("/projects"),
        API.get("/deployments")
      ]);

      if (!projectsRes.data?.success || !Array.isArray(projectsRes.data.data)) {
        throw new Error("Invalid server response while loading projects summary.");
      }

      if (!deploymentsRes.data?.success || !Array.isArray(deploymentsRes.data.data)) {
        throw new Error("Invalid server response while loading deployments summary.");
      }

      setProjects(projectsRes.data.data);
      setDeployments(deploymentsRes.data.data);
      setLastRefresh(new Date().toISOString());
    } catch (err) {
      const message = err?.message?.includes("Invalid server response")
        ? err.message
        : getRequestErrorMessage(err, "Unable to connect to server for dashboard metrics.");
      setError(message);
      showToast(message, "error");
    } finally {
      if (isRefresh) setRefreshing(false);
      else setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const priorityAction = failedDeployments > 0
    ? { label: "View Failures", action: () => navigate("/deployments") }
    : { label: "Create Project", action: () => navigate("/projects") };

  const headerActions = (
    <Button
      onClick={() => loadDashboard(true)}
      loading={refreshing}
      loadingText="Refreshing..."
      disabled={refreshing}
      variant={refreshing ? "muted" : "info"}
      style={{ padding: "8px 16px" }}
    >
      Refresh Insights
    </Button>
  );

  return (
    <PageContainer
      title="DevOps Control Panel"
      subtitle="Manage deployments, review system health, and prioritize operational actions."
      actions={headerActions}
    >
      <PageState
        loading={loading}
        error={error}
        loadingText="Connecting to backend..."
        onRetry={loadDashboard}
        retryLabel="Retry Loading"
      >
        <>
          <Section title="Platform Overview">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: "12px", marginBottom: "14px" }}>
              <StatCard title="Total Projects" value={totalProjects} accent={colors.info} />
              <StatCard title="Total Deployments" value={totalDeployments} accent={colors.primary} />
              <StatCard title="Running Deployments" value={runningDeployments} accent={colors.success} />
              <StatCard title="Failed Deployments" value={failedDeployments} accent={colors.danger} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "12px" }}>
              <Card style={{ marginBottom: 0 }}>
                <h3 style={{ margin: "0 0 8px", color: "#1a1d2e", fontSize: "0.98em" }}>Platform Summary</h3>
                <p style={{ margin: "0 0 6px", color: "#555", fontSize: "0.9em" }}>{totalProjects} active projects</p>
                <p style={{ margin: "0 0 6px", color: "#555", fontSize: "0.9em" }}>{totalDeployments} total deployments</p>
                <p style={{ margin: 0, color: failedDeployments > 0 ? colors.danger : "#555", fontWeight: 600, fontSize: "0.9em" }}>
                  {failedDeployments > 0 ? `${failedDeployments} deployments need attention` : "No deployments need attention"}
                </p>
              </Card>

              <Card style={{ marginBottom: 0 }}>
                <h3 style={{ margin: "0 0 8px", color: "#1a1d2e", fontSize: "0.98em" }}>Deployment Status</h3>
                <p style={{ margin: "0 0 6px", color: "#555", fontSize: "0.9em" }}>Running: {runningDeployments}</p>
                <p style={{ margin: "0 0 6px", color: "#555", fontSize: "0.9em" }}>Building: {buildingDeployments}</p>
                <p style={{ margin: "0 0 6px", color: colors.danger, fontSize: "0.9em", fontWeight: 600 }}>Failed: {failedDeployments}</p>
                <p style={{ margin: 0, color: colors.success, fontSize: "0.9em" }}>Recent Successes: {successDeployments}</p>
              </Card>

              <Card style={{ marginBottom: 0 }}>
                <h3 style={{ margin: "0 0 8px", color: "#1a1d2e", fontSize: "0.98em" }}>Platform Readiness</h3>
                <p style={{ margin: "0 0 6px", color: failedDeployments > 0 ? colors.danger : colors.success, fontWeight: 700 }}>
                  {health}
                </p>
                <p style={{ margin: "0 0 6px", color: "#555", fontSize: "0.88em" }}>Success Rate: {successRate}%</p>
                <p style={{ margin: 0, color: "#6b7280", fontSize: "0.82em" }}>
                  {lastRefresh ? `Last updated ${timeAgo(lastRefresh)} (${formatDate(lastRefresh)})` : "Awaiting initial refresh"}
                </p>
              </Card>
            </div>
          </Section>

          {failedDeployments > 0 && (
            <Section title="Attention Needed">
              <h3 style={{ margin: "0 0 8px", color: "#1a1d2e", fontSize: "0.98em" }}>Platform Health</h3>
              <Card style={{ marginBottom: 0, borderColor: "#f4cccc", background: "#fff7f7" }}>
                <p style={{ margin: "0 0 10px", color: "#8a4040", fontSize: "0.9em" }}>
                  {failedDeployments} deployments failed and require action.
                </p>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  <Button onClick={() => navigate("/deployments")} variant="danger">View Failures</Button>
                  <Button onClick={() => loadDashboard(true)} variant="muted">Refresh Status</Button>
                </div>
              </Card>
            </Section>
          )}

          <Section title="Recent Signals">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "12px" }}>
              <Card style={{ marginBottom: 0 }}>
                <h3 style={{ margin: "0 0 8px", color: colors.danger, fontSize: "0.95em" }}>Recent Failures</h3>
                {recentFailures.length === 0 ? (
                  <p style={{ margin: 0, color: "#6b7280", fontSize: "0.86em" }}>No recent failures.</p>
                ) : (
                  recentFailures.map((deployment) => {
                    const projectName = projectNameById[String(deployment.project_id)] || `Project #${deployment.project_id}`;
                    return (
                      <p key={`failure-${deployment.id}`} style={{ margin: "0 0 6px", color: "#8a4040", fontSize: "0.86em" }}>
                        v{deployment.version} failed for {projectName}
                      </p>
                    );
                  })
                )}
              </Card>

              <Card style={{ marginBottom: 0 }}>
                <h3 style={{ margin: "0 0 8px", color: colors.success, fontSize: "0.95em" }}>Recent Successes</h3>
                {recentSuccesses.length === 0 ? (
                  <p style={{ margin: 0, color: "#6b7280", fontSize: "0.86em" }}>No recent successful deployments yet.</p>
                ) : (
                  recentSuccesses.map((deployment) => {
                    const projectName = projectNameById[String(deployment.project_id)] || `Project #${deployment.project_id}`;
                    return (
                      <p key={`success-${deployment.id}`} style={{ margin: "0 0 6px", color: "#3d7a54", fontSize: "0.86em" }}>
                        v{deployment.version} healthy for {projectName}
                      </p>
                    );
                  })
                )}
              </Card>
            </div>
          </Section>

          <Section title="Action Priorities">
            <Card style={{ marginBottom: 0 }}>
              <h3 style={{ margin: "0 0 10px", color: "#1a1d2e", fontSize: "0.98em" }}>Recommended Next Step</h3>
              <p style={{ margin: "0 0 10px", color: "#555", fontSize: "0.9em" }}>
                {failedDeployments > 0
                  ? "Resolve failed deployments first to restore platform health."
                  : "Platform is stable. Add a project or run a new deployment."}
              </p>
              <Button onClick={priorityAction.action} variant={failedDeployments > 0 ? "danger" : "primary"}>
                {priorityAction.label}
              </Button>
            </Card>
          </Section>

          <Section title="Recent Deployments">
            {recentDeployments.length === 0 ? (
              <EmptyState
                icon="📭"
                title="No Recent Deployments"
                message="Deploy a project to see activity here."
                action={<Button onClick={() => navigate("/projects")} variant="primary">Create Project</Button>}
              />
            ) : (
              <div>
                {recentDeployments.map((deployment) => (
                  <DeploymentCard key={deployment.id} deployment={deployment} />
                ))}
              </div>
            )}
          </Section>

          <Section title="Recent Operations">
            <Card style={{ marginBottom: 0 }}>
              {recentActivities.length === 0 ? (
                <EmptyState
                  icon="🕒"
                  title="No Activity Yet"
                  message="Platform activity will appear here."
                />
              ) : (
                <div>
                  {recentActivities.map((activity) => (
                    <ActivityItem key={`${activity.type}-${activity.date}-${activity.message}`} activity={activity} />
                  ))}
                </div>
              )}
            </Card>
          </Section>

          <Section title="Quick Navigation">
            <Card style={{ marginBottom: 0 }}>
              <h3 style={{ margin: "0 0 10px", color: "#1a1d2e", fontSize: "0.98em" }}>Quick Navigation</h3>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <Button onClick={() => navigate("/projects")} variant="info">View Projects</Button>
                <Button onClick={() => navigate("/deployments")} variant="info">View Deployments</Button>
                <Button
                  onClick={() => {
                    if (!recentDeployments.length) return;
                    navigate(`/deployments/${recentDeployments[0].id}`);
                  }}
                  disabled={!recentDeployments.length}
                  variant={recentDeployments.length ? "info" : "muted"}
                >
                  View Latest Logs
                </Button>
                <Button onClick={() => navigate("/projects")} variant="primary">Create Project</Button>
              </div>
            </Card>
          </Section>

          <Section title="About Platform">
            <Card style={{ marginBottom: 0 }}>
              <h3 style={{ margin: "0 0 8px", color: "#1a1d2e", fontSize: "0.95em" }}>About Platform</h3>
              <p style={{ margin: 0, color: "#555", fontSize: "0.88em", lineHeight: 1.6 }}>
                DevDeploy helps teams create projects, run deployments, and monitor operational health from a single interface.
              </p>
            </Card>
          </Section>

          <p style={{ margin: "4px 0 0", color: "#6b7280", fontSize: "0.8em" }}>
            {lastRefresh ? `System insights updated ${timeAgo(lastRefresh)}.` : "System insights will appear after first refresh."}
          </p>
        </>
      </PageState>
    </PageContainer>
  );
}

export default Dashboard;

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import DeploymentCard from "../components/DeploymentCard";
import PageContainer from "../components/PageContainer";
import Button from "../components/ui/Button";
import Section from "../components/ui/Section";
import EmptyState from "../components/ui/EmptyState";
import PageState from "../components/ui/PageState";
import { useToastContext } from "../hooks/useToast";
import { spacing } from "../utils/theme";
import { getRequestErrorMessage } from "../utils/requestErrors";

function Deployments() {
  const navigate = useNavigate();
  const [deployments, setDeployments] = useState([]);
  const [projectCount, setProjectCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const { showToast } = useToastContext();
  const itemsPerPage = 6;

  const filteredDeployments = deployments
    .filter((dep) => {
      if (filter === "all") return true;
      return dep.status === filter;
    })
    .sort((a, b) => {
      if (sort === "newest") {
        return new Date(b.created_at) - new Date(a.created_at);
      }
      return new Date(a.created_at) - new Date(b.created_at);
    });
  const totalPages = Math.max(1, Math.ceil(filteredDeployments.length / itemsPerPage));
  const start = (page - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const visibleDeployments = filteredDeployments.slice(start, end);

  const loadDeployments = (isInitial = false) => {
    if (isInitial) setLoading(true);
    else setRefreshing(true);
    setError(null);
    API.get("/deployments")
      .then(res => {
        if (!res.data || !res.data.success || !Array.isArray(res.data.data)) {
          throw new Error("invalid_deployments_response");
        }
        setDeployments(res.data.data);
        setError(null);
      })
      .catch((err) => {
        const message = err?.message === "invalid_deployments_response"
          ? "Invalid server response while loading deployments."
          : getRequestErrorMessage(err, "Failed to load deployments.");
        setError(message);
        showToast(message, "error");
      })
      .finally(() => {
        if (isInitial) setLoading(false);
        else setRefreshing(false);
      });
  };

  const loadProjectCount = () => {
    API.get("/projects")
      .then((res) => {
        if (res.data?.success && Array.isArray(res.data.data)) {
          setProjectCount(res.data.data.length);
        }
      })
      .catch(() => {
        setProjectCount(0);
        showToast("Unable to load projects summary for deployment hints.", "error");
      });
  };

  useEffect(() => {
    loadDeployments(true);
    loadProjectCount();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [filter, sort]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const refreshButton = (
    <Button
      onClick={() => loadDeployments(false)}
      loading={refreshing}
      loadingText="Refreshing..."
      disabled={loading || refreshing}
      variant={loading || refreshing ? "muted" : "info"}
      style={{
        padding: "8px 18px",
        borderRadius: "6px"
      }}
    >
      🔄 Refresh
    </Button>
  );

  return (
    <PageContainer title="Deployments" subtitle="All deployment history across your projects" actions={refreshButton}>
      <Section>
        <PageState
          loading={loading}
          error={error}
          loadingText="Loading deployments..."
          onRetry={() => loadDeployments(false)}
          retryLabel="Retry Loading"
          retrying={refreshing}
        >
          {deployments.length > 0 && (
          <div style={{ marginBottom: "20px", display: "flex", gap: spacing.buttonGap, alignItems: "center", flexWrap: "wrap" }}>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              style={{
                padding: "8px 10px",
                borderRadius: "6px",
                border: "1px solid #d7dee5",
                background: "#fff"
              }}
            >
              <option value="all">All</option>
              <option value="running">Running</option>
              <option value="failed">Failed</option>
              <option value="building">Building</option>
            </select>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              style={{
                padding: "8px 10px",
                borderRadius: "6px",
                border: "1px solid #d7dee5",
                background: "#fff"
              }}
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
            </select>

            <span style={{ color: "#6b7280", fontSize: "0.85em" }}>
              Showing {filteredDeployments.length} of {deployments.length} deployments
            </span>
          </div>
          )}

          {deployments.length === 0 && (
          <EmptyState
            icon="🚀"
            title="No Deployments Yet"
            message={projectCount > 0
              ? "Deploy a project to see deployments here."
              : "Create your first project, then deploy to see deployments here."}
            action={(
              <Button onClick={() => navigate("/projects")} variant={projectCount > 0 ? "primary" : "info"}>
                {projectCount > 0 ? "Deploy Project" : "Go to Projects"}
              </Button>
            )}
          />
          )}

          {deployments.length > 0 && filteredDeployments.length === 0 && (
          <EmptyState
            icon="🔎"
            title="No Matching Deployments"
            message="Try changing status filter or sort order."
            action={(
              <Button
                onClick={() => {
                  setFilter("all");
                  setSort("newest");
                }}
                variant="muted"
              >
                Reset Filters
              </Button>
            )}
          />
          )}

          {visibleDeployments.map((deployment) => (
            <DeploymentCard key={deployment.id} deployment={deployment} />
          ))}

          {filteredDeployments.length > 0 && (
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

export default Deployments;

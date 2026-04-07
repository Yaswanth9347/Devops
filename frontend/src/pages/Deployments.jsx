import { useEffect, useState } from "react";
import API from "../services/api";
import DeploymentCard from "../components/DeploymentCard";
import Alert from "../components/Alert";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";
import PageContainer from "../components/PageContainer";

function Deployments() {
  const [deployments, setDeployments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadDeployments = () => {
    setLoading(true);
    setError(null);
    API.get("/deployments")
      .then(res => {
        if (res.data && res.data.success) setDeployments(res.data.data);
      })
      .catch(() => setError("Failed to load deployments. Is the backend running?"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadDeployments(); }, []);

  const refreshButton = (
    <button
      onClick={loadDeployments}
      disabled={loading}
      style={{
        padding: "8px 18px",
        background: loading ? "#95a5a6" : "#3498db",
        color: "white", border: "none", borderRadius: "6px",
        cursor: loading ? "not-allowed" : "pointer", fontWeight: "600"
      }}
    >
      {loading ? "⏳ Loading..." : "🔄 Refresh"}
    </button>
  );

  return (
    <PageContainer title="Deployments" subtitle="All deployment history across your projects" actions={refreshButton}>
      {error && <Alert message={error} type="error" onDismiss={() => setError(null)} />}
      {loading && <Loader text="Loading deployments..." />}

      {!loading && !error && deployments.length === 0 && (
        <EmptyState icon="🚀" title="No Deployments Yet" message="Go to Projects and click Deploy to start your first deployment." />
      )}

      {!loading && deployments.map(d => (
        <DeploymentCard key={d.id} deployment={d} />
      ))}
    </PageContainer>
  );
}

export default Deployments;

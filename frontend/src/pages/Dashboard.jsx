import { useEffect, useState } from "react";
import API from "../services/api";
import Loader from "../components/Loader";
import Alert from "../components/Alert";
import PageContainer from "../components/PageContainer";

function Dashboard() {
  const [metrics, setMetrics] = useState({ projects: 0, deployments: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectsRes, deploymentsRes] = await Promise.all([
          API.get("/projects"),
          API.get("/deployments")
        ]);
        setMetrics({
          projects: projectsRes.data.success ? projectsRes.data.data.length : 0,
          deployments: deploymentsRes.data.success ? deploymentsRes.data.data.length : 0
        });
      } catch (err) {
        setError("Failed to connect to backend. Is the server running on port 8001?");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <PageContainer title="Dashboard" subtitle="Platform overview and metrics">
      {error && <Alert message={error} type="error" onDismiss={() => setError(null)} />}
      {loading && <Loader text="Connecting to backend..." />}

      {!loading && !error && (
        <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
          <div style={{
            flex: 1, minWidth: "180px", padding: "30px",
            background: "#1abc9c", color: "white", borderRadius: "12px", textAlign: "center",
            boxShadow: "0 4px 12px rgba(26,188,156,0.3)"
          }}>
            <p style={{ margin: "0 0 8px", opacity: 0.85 }}>Total Projects</p>
            <p style={{ fontSize: "3em", fontWeight: "bold", margin: 0 }}>{metrics.projects}</p>
          </div>
          <div style={{
            flex: 1, minWidth: "180px", padding: "30px",
            background: "#3498db", color: "white", borderRadius: "12px", textAlign: "center",
            boxShadow: "0 4px 12px rgba(52,152,219,0.3)"
          }}>
            <p style={{ margin: "0 0 8px", opacity: 0.85 }}>Total Deployments</p>
            <p style={{ fontSize: "3em", fontWeight: "bold", margin: 0 }}>{metrics.deployments}</p>
          </div>
        </div>
      )}
    </PageContainer>
  );
}

export default Dashboard;

import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../services/api";
import Loader from "../components/Loader";
import Alert from "../components/Alert";
import PageContainer from "../components/PageContainer";
import StatusBadge from "../components/StatusBadge";

function DeploymentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [deployment, setDeployment] = useState(null);
  const [runtimeLogs, setRuntimeLogs] = useState("");
  const [buildLogs, setBuildLogs] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("runtime");

  const loadDetails = () => {
    setError(null);
    API.get(`/deployments/${id}/details`)
      .then(res => {
        if (res.data && res.data.success) {
          setDeployment(res.data.data);
          setRuntimeLogs(res.data.data.runtime_logs || "No logs available");
          setBuildLogs(res.data.data.build_logs || "No build logs available");
        }
      })
      .catch(() => setError("Failed to load deployment details."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadDetails();

    const interval = setInterval(() => {
      API.get(`/deployments/${id}/details`)
        .then(res => {
          if (res.data && res.data.success) {
            setDeployment(res.data.data);
            setRuntimeLogs(res.data.data.runtime_logs || "No logs available");
            setBuildLogs(res.data.data.build_logs || "No build logs available");
          }
        })
        .catch(() => {});
    }, 5000);

    return () => clearInterval(interval);
  }, [id]);

  if (loading) return <Loader text="Loading deployment details..." />;
  if (error) return <div style={{ padding: '20px' }}><Alert message={error} type="error" /><button onClick={() => navigate("/deployments")} style={{ marginTop: '10px', padding: '8px 16px', background: '#95a5a6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>← Back</button></div>;
  if (!deployment) return <div style={{ padding: '20px' }}><Alert message="Deployment not found." type="warning" /></div>;

  const tabStyle = (tab) => ({
    padding: '7px 18px',
    background: activeTab === tab ? '#1a1d2e' : '#f0f2f5',
    color: activeTab === tab ? 'white' : '#555',
    border: 'none',
    borderRadius: '6px 6px 0 0',
    cursor: 'pointer',
    marginRight: '4px',
    fontWeight: activeTab === tab ? '600' : '400',
    fontSize: '0.88em'
  });

  const sectionCard = { background: '#fff', border: '1px solid #e8ecf0', borderRadius: '8px', padding: '20px', marginBottom: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' };
  const labelStyle = { color: '#888', fontSize: '0.8em', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 3px' };
  const valueStyle = { margin: '0 0 14px', color: '#1a1d2e', fontSize: '0.95em' };

  const headerActions = (
    <div style={{ display: "flex", gap: "10px" }}>
      <button onClick={() => navigate("/deployments")} style={{ padding: "7px 16px", background: "#95a5a6", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "600" }}>← Back</button>
      <button onClick={loadDetails} style={{ padding: "7px 16px", background: "#3498db", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "600" }}>🔄 Refresh</button>
    </div>
  );

  return (
    <PageContainer
      title={`Deployment #${deployment.id}`}
      subtitle={`Version ${deployment.version} · Project #${deployment.project_id}`}
      actions={headerActions}
    >
      {/* Status Row */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' }}>
        {[
          { label: 'Status', content: <StatusBadge status={deployment.status} size="lg" /> },
          { label: 'Build', content: <StatusBadge status={deployment.build_status} size="lg" /> },
          { label: 'Port', content: <span style={{ fontWeight: 'bold', fontSize: '1.1em' }}>{deployment.port || '—'}</span> },
          { label: 'Active', content: <span style={{ fontWeight: 'bold', fontSize: '1.1em' }}>{deployment.is_active ? '✅ Yes' : '❌ No'}</span> },
        ].map(({ label, content }) => (
          <div key={label} style={{ flex: 1, minWidth: '130px', padding: '14px 18px', background: '#fff', border: '1px solid #e8ecf0', borderRadius: '8px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <p style={labelStyle}>{label}</p>
            <div>{content}</div>
          </div>
        ))}
      </div>

      {/* Deployment Info */}
      <div style={sectionCard}>
        <h3 style={{ margin: '0 0 16px', fontSize: '0.95em', color: '#1a1d2e', borderBottom: '1px solid #f0f2f5', paddingBottom: '10px' }}>Deployment Info</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '4px 20px' }}>
          {[
            ['Project ID', `#${deployment.project_id}`],
            ['Runtime', deployment.runtime || '—'],
            ['Image', deployment.image || '—'],
            ['Health', deployment.health || 'unknown'],
            ['Retries', `${deployment.retry_count} / ${deployment.max_retries}`],
            ['Last Error', deployment.last_error || 'None'],
          ].map(([label, value]) => (
            <div key={label}>
              <p style={labelStyle}>{label}</p>
              <p style={valueStyle}>{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Access / URL */}
      <div style={sectionCard}>
        <h3 style={{ margin: '0 0 12px', fontSize: '0.95em', color: '#1a1d2e', borderBottom: '1px solid #f0f2f5', paddingBottom: '10px' }}>Access</h3>
        {deployment.url ? (
          <a
            href={deployment.url}
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'inline-block', padding: '10px 22px',
              background: '#27ae60', color: 'white',
              borderRadius: '6px', textDecoration: 'none',
              fontWeight: '600', fontSize: '0.9em'
            }}
          >
            🌐 Open Application → {deployment.url}
          </a>
        ) : (
          <p style={{ color: '#bbb', margin: 0 }}>Application URL not available yet.</p>
        )}
      </div>

      {/* Logs */}
      <div style={sectionCard}>
        <h3 style={{ margin: '0 0 12px', fontSize: '0.95em', color: '#1a1d2e', borderBottom: '1px solid #f0f2f5', paddingBottom: '10px' }}>Logs</h3>
        <div style={{ marginBottom: '8px' }}>
          <button style={tabStyle("runtime")} onClick={() => setActiveTab("runtime")}>Runtime Logs</button>
          <button style={tabStyle("build")} onClick={() => setActiveTab("build")}>Build Logs</button>
        </div>
        <div style={{
          background: '#0b0b0b',
          color: '#00ff9c',
          padding: '16px',
          fontFamily: "'Courier New', monospace",
          fontSize: '0.82em',
          lineHeight: '1.6',
          height: '320px',
          overflowY: 'auto',
          borderRadius: '0 6px 6px 6px',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-all'
        }}>
          {activeTab === "runtime" ? runtimeLogs : buildLogs}
        </div>
        <p style={{ color: '#aaa', fontSize: '0.78em', margin: '8px 0 0' }}>⏱ Auto-refreshing every 5 seconds</p>
      </div>
    </PageContainer>
  );
}

export default DeploymentDetails;

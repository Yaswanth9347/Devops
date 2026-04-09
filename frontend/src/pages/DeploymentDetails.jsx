import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import API from "../services/api";
import Loader from "../components/Loader";
import PageContainer from "../components/PageContainer";
import StatusBadge from "../components/StatusBadge";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Section from "../components/ui/Section";
import Breadcrumb from "../components/ui/Breadcrumb";
import Spinner from "../components/ui/Spinner";
import ErrorMessage from "../components/ui/ErrorMessage";
import EmptyState from "../components/ui/EmptyState";
import { useToastContext } from "../hooks/useToast";
import { spacing } from "../utils/theme";
import { getRequestErrorMessage } from "../utils/requestErrors";
import { formatDate, timeAgo } from "../utils/date";
import { shortenUrl, shortId } from "../utils/url";

function DeploymentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [deployment, setDeployment] = useState(null);
  const [runtimeLogs, setRuntimeLogs] = useState("");
  const [buildLogs, setBuildLogs] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [logsRefreshing, setLogsRefreshing] = useState(false);
  const [copyingLogs, setCopyingLogs] = useState(false);
  const [lastLogsUpdate, setLastLogsUpdate] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("runtime");
  const [copying, setCopying] = useState(false);
  const { showToast } = useToastContext();
  const logsContainerRef = useRef(null);

  const loadDetails = (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    setError(null);
    API.get(`/deployments/${id}/details`)
      .then(res => {
        if (!res.data || !res.data.success || !res.data.data) {
          throw new Error("Invalid server response while loading deployment details.");
        }
        setDeployment(res.data.data);
        setRuntimeLogs(res.data.data.runtime_logs || "");
        setBuildLogs(res.data.data.build_logs || "");
        setLastLogsUpdate(new Date().toISOString());
        setError(null);
      })
      .catch((err) => {
        const message = err?.message === "Invalid server response while loading deployment details."
          ? err.message
          : getRequestErrorMessage(err, "Unable to load deployment details.");
        setError(message);
      })
      .finally(() => {
        if (isRefresh) setRefreshing(false);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadDetails();

    const interval = setInterval(() => {
      setLogsRefreshing(true);
      API.get(`/deployments/${id}/details`)
        .then(res => {
          if (res.data && res.data.success) {
            setDeployment(res.data.data);
            setRuntimeLogs(res.data.data.runtime_logs || "");
            setBuildLogs(res.data.data.build_logs || "");
            setLastLogsUpdate(new Date().toISOString());
          }
        })
        .catch(() => {
          setError("Network error occurred while refreshing deployment logs.");
        });
      setTimeout(() => setLogsRefreshing(false), 500);
    }, 5000);

    return () => clearInterval(interval);
  }, [id]);

  const activeLogs = activeTab === "runtime" ? runtimeLogs : buildLogs;
  const activeLogLines = useMemo(() => {
    if (!activeLogs || !String(activeLogs).trim()) return [];
    return String(activeLogs).split("\n");
  }, [activeLogs]);

  useEffect(() => {
    if (logsContainerRef.current) {
      logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
    }
  }, [activeTab, runtimeLogs, buildLogs]);

  if (loading) return <Loader text="Loading deployment details..." />;

  if (error) {
    return (
      <PageContainer
        title="Deployment Details"
        subtitle="Load failed"
        actions={<Button onClick={() => navigate(-1)} variant="muted">← Back</Button>}
      >
        <ErrorMessage
          message={error}
          onRetry={() => loadDetails(true)}
          retryLabel="Retry Loading"
          retrying={refreshing}
        />
      </PageContainer>
    );
  }

  if (!deployment) {
    return (
      <PageContainer title="Deployment Details" subtitle="Not available">
        <ErrorMessage
          message="Deployment details are unavailable."
          onRetry={() => loadDetails(true)}
          retryLabel="Retry Loading"
          retrying={refreshing}
        />
      </PageContainer>
    );
  }

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

  const labelStyle = { color: '#888', fontSize: '0.8em', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 3px' };
  const valueStyle = { margin: '0 0 14px', color: '#1a1d2e', fontSize: '0.95em' };

  const copyUrl = async () => {
    if (!deployment?.url) return;

    setCopying(true);
    try {
      await navigator.clipboard.writeText(deployment.url);
      showToast("Deployment URL copied.", "success");
    } catch {
      showToast("Unable to copy URL. Please copy it manually.", "error");
    } finally {
      setCopying(false);
    }
  };

  const headerActions = (
    <div style={{ display: "flex", gap: spacing.buttonGap }}>
      <Button onClick={() => navigate(-1)} variant="muted" style={{ padding: "7px 16px" }}>← Back</Button>
      <Button onClick={() => loadDetails(true)} loading={refreshing} loadingText="Refreshing..." variant="info" style={{ padding: "7px 16px" }}>🔄 Refresh</Button>
    </div>
  );

  const refreshLogs = () => {
    setLogsRefreshing(true);
    API.get(`/deployments/${id}/details`)
      .then((res) => {
        if (res.data && res.data.success && res.data.data) {
          setDeployment(res.data.data);
          setRuntimeLogs(res.data.data.runtime_logs || "");
          setBuildLogs(res.data.data.build_logs || "");
          setLastLogsUpdate(new Date().toISOString());
          showToast("Logs refreshed.", "info");
          return;
        }
        showToast("Unable to refresh logs.", "error");
      })
      .catch(() => {
        showToast("Unable to refresh logs.", "error");
      })
      .finally(() => setLogsRefreshing(false));
  };

  const copyLogs = async () => {
    if (!activeLogLines.length) return;

    setCopyingLogs(true);
    try {
      await navigator.clipboard.writeText(activeLogLines.join("\n"));
      showToast("Logs copied.", "success");
    } catch {
      showToast("Unable to copy logs.", "error");
    } finally {
      setCopyingLogs(false);
    }
  };

  const getLogLineStyle = (line) => {
    const content = String(line || "").toLowerCase();
    if (content.includes("error") || content.includes("exception") || content.includes("failed")) {
      return { color: "#ff7b72" };
    }
    if (content.includes("warn")) {
      return { color: "#f2cc60" };
    }
    if (content.includes("success") || content.includes("completed") || content.includes("running")) {
      return { color: "#7ee787" };
    }
    return { color: "#c9d1d9" };
  };

  return (
    <PageContainer
      title={`Deployment #${shortId(deployment.id)}`}
      subtitle={`Version ${deployment.version} · ${deployment.status} · ${timeAgo(deployment.created_at)} (${formatDate(deployment.created_at)})`}
      actions={headerActions}
    >
      <Breadcrumb
        items={[
          { label: "Projects", link: "/projects" },
          { label: `Project #${deployment.project_id}`, link: `/projects/${deployment.project_id}` },
          { label: `Deployment #${deployment.id}` }
        ]}
      />

      <Section title="Status Overview">
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' }}>
          {[
            { label: 'Status', content: <StatusBadge status={deployment.status} size="lg" /> },
            { label: 'Build', content: <StatusBadge status={deployment.build_status} size="lg" /> },
            { label: 'Port', content: <span style={{ fontWeight: 'bold', fontSize: '1.1em' }}>{deployment.port || '—'}</span> },
            { label: 'Active', content: <span style={{ fontWeight: 'bold', fontSize: '1.1em' }}>{deployment.is_active ? '✅ Yes' : '❌ No'}</span> },
          ].map(({ label, content }) => (
            <Card key={label} style={{ flex: 1, minWidth: '130px', padding: '14px 18px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              <p style={labelStyle}>{label}</p>
              <div>{content}</div>
            </Card>
          ))}
        </div>
      </Section>

      <Section title="Deployment Info">
        <Card style={{ padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '4px 20px' }}>
            {[
              ['Deployment ID', `${shortId(deployment.id)} (full: ${deployment.id})`],
              ['Project ID', `#${deployment.project_id}`],
              ['Version', `v${deployment.version}`],
              ['Created', `${timeAgo(deployment.created_at)} (${formatDate(deployment.created_at)})`],
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
        </Card>
      </Section>

      <Section title="Access">
        <Card style={{ padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          {deployment.url ? (
            <div style={{ display: 'grid', gap: '12px' }}>
              <p style={{ margin: 0, color: '#555', fontSize: '0.9em' }}>
                <strong>URL:</strong>{' '}
                <a href={deployment.url} target="_blank" rel="noreferrer" title={deployment.url} style={{ color: '#3498db' }}>
                  {shortenUrl(deployment.url)}
                </a>
              </p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
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
                  🌐 Open Deployment
                </a>
                <Button
                  onClick={copyUrl}
                  loading={copying}
                  loadingText="Copying..."
                  disabled={copying}
                  variant="muted"
                >
                  Copy URL
                </Button>
              </div>
            </div>
          ) : (
            <p style={{ color: '#bbb', margin: 0 }}>Application URL not available yet.</p>
          )}
        </Card>
      </Section>

      <Section title="Logs">
        <Card style={{ padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '6px' }}>
            <h3 style={{ margin: 0, color: '#1a1d2e', fontSize: '0.95em', display: 'flex', alignItems: 'center', gap: '8px' }}>
              Deployment Logs
              {logsRefreshing && <Spinner size={14} borderWidth={2} color="#1a1d2e" trackColor="#d1d5db" inline />}
            </h3>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <Button onClick={refreshLogs} loading={logsRefreshing} loadingText="Refreshing..." disabled={logsRefreshing} variant="info" style={{ padding: '6px 12px', fontSize: '0.8em' }}>
                Refresh Logs
              </Button>
              <Button onClick={copyLogs} loading={copyingLogs} loadingText="Copying..." disabled={copyingLogs || !activeLogLines.length} variant="muted" style={{ padding: '6px 12px', fontSize: '0.8em' }}>
                Copy Logs
              </Button>
            </div>
          </div>
          <p style={{ margin: '0 0 10px', color: '#6b7280', fontSize: '0.82em' }}>
            Auto updating every 5 seconds{lastLogsUpdate ? ` · Last updated ${timeAgo(lastLogsUpdate)} (${formatDate(lastLogsUpdate)})` : ''}
          </p>
          <div style={{ marginBottom: '8px', display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            <Button variant={activeTab === "runtime" ? "primary" : "muted"} onClick={() => setActiveTab("runtime")} style={tabStyle("runtime")}>Runtime Logs</Button>
            <Button variant={activeTab === "build" ? "primary" : "muted"} onClick={() => setActiveTab("build")} style={tabStyle("build")}>Build Logs</Button>
          </div>
          {activeLogLines.length === 0 ? (
            <EmptyState
              icon="📜"
              title="No Logs Yet"
              message="Logs will appear once deployment starts."
            />
          ) : (
            <div
              ref={logsContainerRef}
              style={{
                background: '#0d1117',
                color: '#c9d1d9',
                padding: '15px',
                borderRadius: '10px',
                fontFamily: "'Courier New', monospace",
                fontSize: '13px',
                lineHeight: '1.6',
                height: '400px',
                overflowY: 'auto',
                border: '1px solid #30363d',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
              }}
            >
              {activeLogLines.map((line, index) => (
                <p
                  key={`${activeTab}-${index}-${line.slice(0, 10)}`}
                  style={{ margin: '0 0 2px', ...getLogLineStyle(line) }}
                >
                  {line || ' '}
                </p>
              ))}
            </div>
          )}
        </Card>
      </Section>
    </PageContainer>
  );
}

export default DeploymentDetails;

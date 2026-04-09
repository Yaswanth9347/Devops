import { useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import StatusBadge from "./StatusBadge";
import { useToastContext } from "../hooks/useToast";
import Button from "./ui/Button";
import Card from "./ui/Card";
import ConfirmDialog from "./ui/ConfirmDialog";
import { formatDate, timeAgo } from "../utils/date";
import { shortenUrl, shortId } from "../utils/url";

const STATUS_BORDER = {
  running:   '#27ae60',
  failed:    '#e74c3c',
  building:  '#9b59b6',
  deploying: '#1abc9c',
  pending:   '#f39c12',
  stopped:   '#7f8c8d',
  cloning:   '#3498db',
};

function DeploymentCard({ deployment, onActionComplete }) {
  const [retrying, setRetrying] = useState(false);
  const [copying, setCopying] = useState(false);
  const [showRetryConfirm, setShowRetryConfirm] = useState(false);
  const [statusOverride, setStatusOverride] = useState(null);
  const { showToast } = useToastContext();
  const currentStatus = statusOverride || deployment.status;
  const borderColor = STATUS_BORDER[currentStatus] || '#ddd';

  const copyUrl = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (!deployment.url) return;

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

  const openRetryConfirm = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setShowRetryConfirm(true);
  };

  const retryDeployment = () => {
    setRetrying(true);
    API.post(`/deployments/${deployment.id}/retry`)
      .then((res) => {
        if (res.data?.success) {
          setStatusOverride("pending");
          setShowRetryConfirm(false);
          if (onActionComplete) onActionComplete();
          showToast("Deployment retry started.", "info");
        }
      })
      .catch(() => showToast("Unable to retry deployment. Check backend logs and try again.", "error"))
      .finally(() => setRetrying(false));
  };

  const cancelRetry = () => {
    if (retrying) return;
    setShowRetryConfirm(false);
  };

  return (
    <>
      <Link to={`/deployments/${deployment.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <Card
          style={{
            borderLeft: `4px solid ${borderColor}`,
            padding: '16px 20px',
            transition: 'box-shadow 0.15s ease, transform 0.1s ease',
            cursor: 'pointer',
          }}
          onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.12)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)'; e.currentTarget.style.transform = 'translateY(0)'; }}
        >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <div style={{ display: 'grid', gap: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <strong style={{ fontSize: '1em', color: '#1a1d2e' }}>Deployment #{shortId(deployment.id)}</strong>
            </div>
            <div style={{ fontSize: '0.82em', color: '#555' }}><strong>Version:</strong> v{deployment.version}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <strong style={{ fontSize: '0.82em', color: '#555' }}>Status:</strong>
            <StatusBadge status={currentStatus} />
          </div>
        </div>

        <div style={{ marginTop: '10px', borderTop: '1px solid #f0f0f0', paddingTop: '10px', display: 'grid', gap: '8px' }}>
          <div style={{ fontSize: '0.85em', color: '#555', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <strong>URL:</strong>{' '}
            {deployment.url ? (
              <>
                <a
                  href={deployment.url}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(event) => event.stopPropagation()}
                  style={{ color: '#3498db' }}
                  title={deployment.url}
                >
                  {shortenUrl(deployment.url)}
                </a>
                <Button
                  onClick={copyUrl}
                  loading={copying}
                  loadingText="Copying..."
                  disabled={copying}
                  variant="muted"
                  style={{ padding: '4px 10px', fontSize: '0.75em' }}
                >
                  Copy URL
                </Button>
              </>
            ) : (
              <span style={{ color: '#bbb' }}>Not deployed yet</span>
            )}
          </div>
          <div style={{ fontSize: '0.8em', color: '#888' }}>
            <strong>Project:</strong> #{deployment.project_id} · <strong>Created:</strong> {timeAgo(deployment.created_at)} ({formatDate(deployment.created_at)})
          </div>
        </div>

        <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.78em', color: '#3498db', fontWeight: '600' }}>View details →</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {currentStatus === "failed" && (
                <Button
                  onClick={openRetryConfirm}
                  loading={retrying}
                  loadingText="Retrying..."
                  disabled={retrying}
                  variant={retrying ? "muted" : "warning"}
                  style={{
                    padding: '5px 10px',
                    fontSize: '0.76em',
                    borderRadius: '5px'
                  }}
                >
                  Retry Deployment
                </Button>
              )}
            </div>
          </div>
        </Card>
      </Link>

      {showRetryConfirm && (
        <ConfirmDialog
          title="Retry Deployment"
          message={`Retry deployment #${deployment.id}? This will start a new deployment attempt.`}
          confirmLabel="Start Retry"
          cancelLabel="Cancel"
          onConfirm={retryDeployment}
          onCancel={cancelRetry}
          confirming={retrying}
        />
      )}
    </>
  );
}

export default DeploymentCard;

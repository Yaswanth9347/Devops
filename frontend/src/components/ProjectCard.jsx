import API from "../services/api";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useToastContext } from "../hooks/useToast";
import Button from "./ui/Button";
import Card from "./ui/Card";
import ConfirmDialog from "./ui/ConfirmDialog";
import { spacing } from "../utils/theme";
import { shortenUrl } from "../utils/url";

function ProjectCard({ project, onDeployStarted }) {
  const [deploying, setDeploying] = useState(false);
  const [showDeployConfirm, setShowDeployConfirm] = useState(false);
  const { showToast } = useToastContext();

  const handleDeploy = () => {
    setShowDeployConfirm(false);
    setDeploying(true);
    API.post("/deployments", { project_id: project.id })
      .then((res) => {
        if (res.data && res.data.success) {
          if (onDeployStarted) onDeployStarted();
          else showToast("Deployment queued.", "info");
        }
      })
      .catch(() => showToast("Deployment failed to start. Check backend and worker status.", "error"))
      .finally(() => setDeploying(false));
  };

  return (
    <>
      <Card style={{ padding: "18px 20px", marginBottom: spacing.cardGap }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
        <Link to={`/projects/${project.id}`} style={{ textDecoration: 'none', color: 'inherit', flex: 1, minWidth: 0 }}>
          <div>
            <h3 style={{ margin: '0 0 3px', fontSize: '1.05em', color: '#1a1d2e' }}>{project.name}</h3>
            <p style={{ margin: 0, color: '#888', fontSize: '0.85em' }}>{project.description || 'No description'}</p>
          </div>
        </Link>
      </div>

      <div style={{ marginTop: "10px", borderTop: '1px solid #f0f0f0', paddingTop: '10px' }}>
        <div style={{ display: 'grid', gap: '8px' }}>
          <div style={{ fontSize: '0.82em', color: '#666' }}>
            <strong>Repository:</strong>{' '}
            {project.repo_url
              ? <a href={project.repo_url} target="_blank" rel="noreferrer" title={project.repo_url} style={{ color: '#3498db' }}>{shortenUrl(project.repo_url)}</a>
              : <span style={{ color: '#bbb' }}>Not configured</span>}
          </div>
          <div style={{ fontSize: '0.82em', color: '#666' }}><strong>Branch:</strong> {project.branch || 'main'}</div>
        </div>
      </div>

      <div style={{ marginTop: "10px", display: "flex", justifyContent: "flex-end" }}>
        <Button
          onClick={() => setShowDeployConfirm(true)}
          loading={deploying}
          loadingText="Deploying..."
          disabled={deploying}
          variant={deploying ? "muted" : "primary"}
          style={{
            padding: '7px 16px',
            fontSize: '0.85em',
            whiteSpace: 'nowrap',
            flexShrink: 0
          }}
        >
          🚀 Deploy
        </Button>
      </div>
      </Card>

      {showDeployConfirm && (
        <ConfirmDialog
          title="Start Deployment"
          message={`Start deployment for project \"${project.name}\"?`}
          confirmLabel="Start Deployment"
          cancelLabel="Cancel"
          onConfirm={handleDeploy}
          onCancel={() => setShowDeployConfirm(false)}
          confirming={deploying}
        />
      )}
    </>
  );
}

export default ProjectCard;

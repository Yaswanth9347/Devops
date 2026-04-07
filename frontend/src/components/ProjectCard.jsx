import API from "../services/api";
import { useState } from "react";
import StatusBadge from "./StatusBadge";

function ProjectCard({ project, onDeployStarted }) {
  const [deploying, setDeploying] = useState(false);

  const handleDeploy = () => {
    if (!window.confirm(`Start deployment for "${project.name}"?`)) return;
    setDeploying(true);
    API.post("/deployments", { project_id: project.id })
      .then((res) => {
        if (res.data && res.data.success) {
          if (onDeployStarted) onDeployStarted();
        }
      })
      .catch(() => alert("❌ Deploy failed. Check if the backend and worker are running."))
      .finally(() => setDeploying(false));
  };

  return (
    <div style={{
      border: '1px solid #e8ecf0',
      borderRadius: '8px',
      padding: '18px 20px',
      marginBottom: '12px',
      background: '#fff',
      boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    }}>
      {/* Header Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
        <div>
          <h3 style={{ margin: '0 0 3px', fontSize: '1.05em', color: '#1a1d2e' }}>{project.name}</h3>
          <p style={{ margin: 0, color: '#888', fontSize: '0.85em' }}>{project.description || 'No description'}</p>
        </div>
        <button
          onClick={handleDeploy}
          disabled={deploying}
          style={{
            padding: '7px 16px',
            background: deploying ? '#95a5a6' : '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: deploying ? 'not-allowed' : 'pointer',
            fontWeight: '600',
            fontSize: '0.85em',
            whiteSpace: 'nowrap',
            flexShrink: 0
          }}
        >
          {deploying ? '⏳ Deploying...' : '🚀 Deploy'}
        </button>
      </div>

      {/* Details Row */}
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', borderTop: '1px solid #f0f0f0', paddingTop: '10px' }}>
        <span style={{ fontSize: '0.82em', color: '#666' }}>
          <strong>Repo:</strong>{' '}
          {project.repo_url
            ? <a href={project.repo_url} target="_blank" rel="noreferrer" style={{ color: '#3498db' }}>{project.repo_url}</a>
            : <span style={{ color: '#bbb' }}>Not configured</span>}
        </span>
        <span style={{ fontSize: '0.82em', color: '#666' }}>
          <strong>Branch:</strong> {project.branch || 'main'}
        </span>
      </div>
    </div>
  );
}

export default ProjectCard;

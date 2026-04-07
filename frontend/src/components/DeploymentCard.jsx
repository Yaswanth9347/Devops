import { Link } from "react-router-dom";
import StatusBadge from "./StatusBadge";

const STATUS_BORDER = {
  running:   '#27ae60',
  failed:    '#e74c3c',
  building:  '#9b59b6',
  deploying: '#1abc9c',
  pending:   '#f39c12',
  stopped:   '#7f8c8d',
  cloning:   '#3498db',
};

function DeploymentCard({ deployment }) {
  const borderColor = STATUS_BORDER[deployment.status] || '#ddd';

  return (
    <Link to={`/deployments/${deployment.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div
        style={{
          border: '1px solid #e8ecf0',
          borderLeft: `4px solid ${borderColor}`,
          borderRadius: '8px',
          padding: '16px 20px',
          marginBottom: '12px',
          background: '#fff',
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          transition: 'box-shadow 0.15s ease, transform 0.1s ease',
          cursor: 'pointer',
        }}
        onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.12)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
        onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)'; e.currentTarget.style.transform = 'translateY(0)'; }}
      >
        {/* Top Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <strong style={{ fontSize: '1em', color: '#1a1d2e' }}>Version {deployment.version}</strong>
            <span style={{ color: '#aaa', fontSize: '0.8em' }}>#{deployment.id}</span>
          </div>
          <StatusBadge status={deployment.status} />
        </div>

        {/* URL */}
        <p style={{ margin: '0 0 8px', fontSize: '0.88em', color: '#555' }}>
          <strong>URL:</strong>{' '}
          {deployment.url
            ? <span style={{ color: '#3498db' }}>{deployment.url}</span>
            : <span style={{ color: '#bbb' }}>Not deployed yet</span>}
        </p>

        {/* Footer Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <small style={{ color: '#aaa' }}>
            Project #{deployment.project_id} · {new Date(deployment.created_at).toLocaleString()}
          </small>
          <small style={{ color: '#3498db', fontWeight: '600' }}>View details →</small>
        </div>
      </div>
    </Link>
  );
}

export default DeploymentCard;

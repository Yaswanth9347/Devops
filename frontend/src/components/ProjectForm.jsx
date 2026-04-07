import { useState } from "react";
import API from "../services/api";
import Alert from "./Alert";

function ProjectForm({ onCreated, onCancel }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Project name is required.");
      return;
    }

    setLoading(true);
    setError(null);
    API.post("/projects", { name, description })
      .then((res) => {
        if (res.data && res.data.success) {
          onCreated();
          setName("");
          setDescription("");
        }
      })
      .catch(() => setError("Failed to create project. Check backend connection."))
      .finally(() => setLoading(false));
  };

  return (
    <form onSubmit={handleSubmit} style={{
      border: '2px solid #1abc9c',
      borderRadius: '8px',
      padding: '20px',
      margin: '15px 0',
      background: '#f0faf8'
    }}>
      <h3 style={{ marginTop: 0 }}>New Project</h3>

      {error && <Alert message={error} type="error" onDismiss={() => setError(null)} />}

      <div style={{ marginBottom: '10px' }}>
        <input
          placeholder="Project Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
        />
      </div>
      <div style={{ marginBottom: '15px' }}>
        <input
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
        />
      </div>
      <button type="submit" disabled={loading} style={{
        padding: '8px 20px',
        background: loading ? '#95a5a6' : '#1abc9c',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: loading ? 'not-allowed' : 'pointer',
        marginRight: '10px'
      }}>
        {loading ? "⏳ Creating..." : "Create Project"}
      </button>
      <button type="button" onClick={onCancel} disabled={loading} style={{
        padding: '8px 20px', background: '#95a5a6', color: 'white',
        border: 'none', borderRadius: '4px', cursor: 'pointer'
      }}>
        Cancel
      </button>
    </form>
  );
}

export default ProjectForm;

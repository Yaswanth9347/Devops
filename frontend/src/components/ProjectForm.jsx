import { useState } from "react";
import API from "../services/api";
import { useToastContext } from "../hooks/useToast";
import Button from "./ui/Button";
import Card from "./ui/Card";

function ProjectForm({ onCreated, onCancel }) {
  const [name, setName] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [nameError, setNameError] = useState("");
  const [repoError, setRepoError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const { showToast } = useToastContext();

  const isValidRepoUrl = (value) => {
    try {
      const parsed = new URL(value);
      return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
      return false;
    }
  };

  const validateName = (value) => {
    const cleanName = value.trim();
    if (!cleanName) return "Project name is required.";
    return "";
  };

  const validateRepo = (value) => {
    const cleanRepo = value.trim();
    if (!cleanRepo) return "Repository URL is required.";
    if (!isValidRepoUrl(cleanRepo)) return "Enter a valid repository URL (http/https).";
    return "";
  };

  const cleanName = name.trim();
  const cleanRepoUrl = repoUrl.trim();
  const canSubmit = !loading && Boolean(cleanName) && Boolean(cleanRepoUrl) && isValidRepoUrl(cleanRepoUrl);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const nextNameError = validateName(name);
    const nextRepoError = validateRepo(repoUrl);
    setNameError(nextNameError);
    setRepoError(nextRepoError);
    setSubmitError("");

    if (nextNameError || nextRepoError) {
      return;
    }

    setLoading(true);
    try {
      const createdRes = await API.post("/projects", {
        name: cleanName,
        description: description.trim()
      });

      if (!createdRes.data?.success || !createdRes.data?.data?.id) {
        throw new Error("Unable to create project.");
      }

      const createdProject = createdRes.data.data;

      try {
        await API.put(`/projects/${createdProject.id}/source`, {
          repo_url: cleanRepoUrl,
          branch: "main",
          build_path: null
        });
      } catch {
        showToast("Project created, but repository settings could not be saved right now.", "error");
      }

      onCreated();
      setName("");
      setRepoUrl("");
      setDescription("");
      setNameError("");
      setRepoError("");
      setSubmitError("");
    } catch {
      setSubmitError("Unable to create project. Check backend connection.");
      showToast("Unable to create project. Check backend connection.", "error");
    } finally {
      setLoading(false);
    }
  };

  const inputBaseStyle = {
    width: "100%",
    padding: "9px 10px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    boxSizing: "border-box",
    fontSize: "0.9em",
    transition: "border-color 0.15s ease, box-shadow 0.15s ease",
    outline: "none"
  };

  const labelStyle = {
    display: "block",
    marginBottom: "6px",
    color: "#374151",
    fontSize: "0.85em",
    fontWeight: 600
  };

  const helperTextStyle = {
    color: "#6b7280",
    fontSize: "0.76em",
    marginTop: "5px",
    display: "block"
  };

  const errorTextStyle = {
    color: "#d32f2f",
    fontSize: "0.78em",
    marginTop: "5px",
    display: "block"
  };

  const handleNameChange = (event) => {
    const value = event.target.value;
    setName(value);
    if (nameError) setNameError(validateName(value));
  };

  const handleRepoChange = (event) => {
    const value = event.target.value;
    setRepoUrl(value);
    if (repoError) setRepoError(validateRepo(value));
  };

  const handleCancel = () => {
    if (loading) return;
    setNameError("");
    setRepoError("");
    setSubmitError("");
    onCancel();
  };

  const handleInputFocus = (event) => {
    event.currentTarget.style.borderColor = "#1976d2";
    event.currentTarget.style.boxShadow = "0 0 0 2px rgba(25,118,210,0.12)";
  };

  const handleInputBlurStyle = (event, hasError) => {
    event.currentTarget.style.borderColor = hasError ? "#d32f2f" : "#ccc";
    event.currentTarget.style.boxShadow = "none";
  };

  return (
    <Card style={{ border: "2px solid #1abc9c", padding: "20px", margin: "15px 0", background: "#f0faf8" }}>
      <form onSubmit={handleSubmit} noValidate>
        <h3 style={{ marginTop: 0 }}>New Project</h3>

        <div style={{ marginBottom: "15px" }}>
          <label htmlFor="project-name" style={labelStyle}>Project Name</label>
          <input
            id="project-name"
            placeholder="Project Name"
            value={name}
            onChange={handleNameChange}
            onBlur={() => setNameError(validateName(name))}
            onFocus={handleInputFocus}
            onBlurCapture={(event) => handleInputBlurStyle(event, Boolean(nameError || validateName(name)))}
            aria-invalid={Boolean(nameError)}
            style={{
              ...inputBaseStyle,
              borderColor: nameError ? "#d32f2f" : "#ccc"
            }}
          />
          <small style={helperTextStyle}>Give your project a clear, unique name.</small>
          {nameError && <small style={errorTextStyle}>{nameError}</small>}
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label htmlFor="project-repo-url" style={labelStyle}>Repository URL</label>
          <input
            id="project-repo-url"
            placeholder="Repository URL (https://...)"
            value={repoUrl}
            onChange={handleRepoChange}
            onBlur={() => setRepoError(validateRepo(repoUrl))}
            onFocus={handleInputFocus}
            onBlurCapture={(event) => handleInputBlurStyle(event, Boolean(repoError || validateRepo(repoUrl)))}
            aria-invalid={Boolean(repoError)}
            style={{
              ...inputBaseStyle,
              borderColor: repoError ? "#d32f2f" : "#ccc"
            }}
          />
          <small style={helperTextStyle}>Example: https://github.com/user/app</small>
          {repoError && <small style={errorTextStyle}>{repoError}</small>}
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label htmlFor="project-description" style={labelStyle}>Description</label>
          <input
            id="project-description"
            placeholder="Description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            onFocus={handleInputFocus}
            onBlurCapture={(event) => handleInputBlurStyle(event, false)}
            style={inputBaseStyle}
          />
          <small style={helperTextStyle}>Optional short summary of this project.</small>
        </div>

        {submitError && (
          <p style={{ color: "#d32f2f", margin: "0 0 12px", fontSize: "0.85em" }}>{submitError}</p>
        )}

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <Button
            htmlType="submit"
            loading={loading}
            disabled={!canSubmit}
            loadingText="Creating..."
            variant={loading ? "muted" : "primary"}
            style={{ padding: "8px 20px" }}
          >
            Create Project
          </Button>
          <Button onClick={handleCancel} disabled={loading} variant="muted" style={{ padding: "8px 20px" }}>
            Cancel Creation
          </Button>
        </div>
      </form>
    </Card>
  );
}

export default ProjectForm;

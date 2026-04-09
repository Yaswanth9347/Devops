import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import Deployments from "./pages/Deployments";
import DeploymentDetails from "./pages/DeploymentDetails";
import ProjectDetails from "./pages/ProjectDetails";
import NotFound from "./pages/NotFound";
import MainLayout from "./layouts/MainLayout";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout><Dashboard /></MainLayout>} />
        <Route path="/projects" element={<MainLayout><Projects /></MainLayout>} />
        <Route path="/projects/:id" element={<MainLayout><ProjectDetails /></MainLayout>} />
        <Route path="/deployments" element={<MainLayout><Deployments /></MainLayout>} />
        <Route path="/deployments/:id" element={<MainLayout><DeploymentDetails /></MainLayout>} />
        <Route path="*" element={<MainLayout><NotFound /></MainLayout>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

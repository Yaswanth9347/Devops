import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  LineChart, Line, CartesianGrid 
} from "recharts";
import { 
  FolderGit2, Rocket, AlertTriangle, CheckCircle2, 
  Activity, ArrowUpRight, ArrowDownRight, ServerCrash, Zap, AlertCircle
} from "lucide-react";
import API from "../services/api";
import PageContainer from "../components/PageContainer";
import Button from "../components/ui/Button";
import StatusBadge from "../components/StatusBadge";
import { useToastContext } from "../hooks/useToast";
import { getRequestErrorMessage } from "../utils/requestErrors";
import { timeAgo } from "../utils/date";

function StatCard({ title, value, icon: Icon, trend, className = "" }) {
  const isPositive = trend >= 0;
  return (
    <div className={`card ${className}`} style={{ padding: "var(--space-4)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "var(--space-4)" }}>
        <div style={{ padding: "var(--space-2)", background: "var(--bg-hover)", borderRadius: "var(--radius-md)" }}>
          <Icon size={20} color="var(--text-secondary)" />
        </div>
        {trend !== undefined && (
          <div style={{ display: "flex", alignItems: "center", gap: "2px", color: isPositive ? "var(--success-color)" : "var(--error-color)", fontSize: "13px", fontWeight: 500 }}>
            {isPositive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div>
        <h3 style={{ fontSize: "28px", fontWeight: 600, color: "var(--text-primary)", margin: "0 0 4px" }}>{value}</h3>
        <p style={{ color: "var(--text-secondary)", fontSize: "14px", margin: 0 }}>{title}</p>
      </div>
    </div>
  );
}

function Dashboard() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [deployments, setDeployments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { showToast } = useToastContext();

  const loadDashboard = async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true);
    try {
      const [projectsRes, deploymentsRes] = await Promise.all([
        API.get("/projects"),
        API.get("/deployments")
      ]);
      if (projectsRes.data?.success) setProjects(projectsRes.data.data || []);
      if (deploymentsRes.data?.success) setDeployments(deploymentsRes.data.data || []);
    } catch (err) {
      showToast(getRequestErrorMessage(err, "Unable to load dashboard"), "error");
    } finally {
      isRefresh ? setRefreshing(false) : setLoading(false);
    }
  };

  useEffect(() => { loadDashboard(); }, []);

  const totalProjects = projects.length;
  const totalDeployments = deployments.length;
  const running = deployments.filter(d => d.status === "running").length;
  const failed = deployments.filter(d => d.status === "failed").length;
  const successRate = totalDeployments ? Math.round(((totalDeployments - failed) / totalDeployments) * 100) : 0;

  // Mock chart data for UI
  const lineChartData = [
    { name: 'Mon', success: 400, failed: 24 },
    { name: 'Tue', success: 300, failed: 13 },
    { name: 'Wed', success: 200, failed: 8 },
    { name: 'Thu', success: 278, failed: 39 },
    { name: 'Fri', success: 189, failed: 48 },
    { name: 'Sat', success: 239, failed: 38 },
    { name: 'Sun', success: 349, failed: 43 },
  ];

  const barChartData = [
    { reason: 'Build Error', count: 12 },
    { reason: 'Timeout', count: 5 },
    { reason: 'Config', count: 3 },
    { reason: 'Resource', count: 8 }
  ];

  const projectNameById = useMemo(() => {
    return projects.reduce((acc, p) => ({ ...acc, [p.id]: p.name }), {});
  }, [projects]);

  const recentFailures = deployments.filter(d => d.status === "failed").slice(0, 4);
  const recentActivities = deployments.slice(0, 6);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", height: "100%", alignItems: "center" }}>
        <div className="skeleton" style={{ width: "100%", height: "100%" }} />
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      {/* Header Actions */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ marginBottom: "var(--space-1)" }}>Dashboard</h1>
          <p style={{ color: "var(--text-secondary)", margin: 0 }}>Overview of your projects and deployments.</p>
        </div>
        <div style={{ display: "flex", gap: "var(--space-3)" }}>
          <Button variant="secondary" onClick={() => loadDashboard(true)} isLoading={refreshing}>
            Refresh
          </Button>
          <Button variant="primary" onClick={() => navigate("/projects")}>
            New Deployment
          </Button>
        </div>
      </div>

      {failed > 0 && (
         <div style={{
           background: "var(--error-bg)",
           border: "1px solid var(--error-border)",
           padding: "var(--space-4)",
           borderRadius: "var(--radius-md)",
           display: "flex",
           alignItems: "center",
           justifyContent: "space-between"
         }}>
           <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
             <AlertTriangle color="var(--error-color)" />
             <div>
               <h3 style={{ color: "var(--error-color)", margin: "0 0 2px", fontSize: "15px" }}>Attention Needed</h3>
               <p style={{ color: "#7F1D1D", margin: 0, fontSize: "14px" }}>{failed} deployments have failed recently and require your attention.</p>
             </div>
           </div>
           <Button variant="danger" onClick={() => navigate("/deployments")}>View Failures</Button>
         </div>
      )}

      {/* KPI Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "var(--space-4)" }}>
        <StatCard title="Total Projects" value={totalProjects} icon={FolderGit2} trend={12} />
        <StatCard title="Total Deployments" value={totalDeployments} icon={Rocket} trend={24} />
        <StatCard title="Running" value={running} icon={Activity} trend={8} />
        <StatCard title="Failed" value={failed} icon={ServerCrash} trend={failed > 0 ? -15 : 0} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "var(--space-4)" }}>
        {/* Main Charts Area */}
        <div className="card" style={{ padding: "var(--space-5)", display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ fontSize: "18px", margin: 0 }}>Deployment Activity</h2>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "var(--text-secondary)" }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--primary-color)" }} />
                Success
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "var(--text-secondary)" }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--error-color)" }} />
                Failed
              </div>
            </div>
          </div>
          
          <div style={{ height: "300px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-default)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "var(--text-secondary)", fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--text-secondary)", fontSize: 12 }} dx={-10} />
                <Tooltip 
                  contentStyle={{ background: "var(--bg-secondary)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-default)" }}
                />
                <Line type="monotone" dataKey="success" stroke="var(--primary-color)" strokeWidth={3} dot={false} />
                <Line type="monotone" dataKey="failed" stroke="var(--error-color)" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Sidebar Area */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          {/* Health Overview */}
          <div className="card" style={{ padding: "var(--space-5)" }}>
            <h2 style={{ fontSize: "16px", margin: "0 0 var(--space-4)" }}>System Health</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                <span style={{ fontSize: "32px", fontWeight: 700, color: "var(--text-primary)", lineHeight: 1 }}>{successRate}%</span>
                <span style={{ color: "var(--text-secondary)", fontSize: "14px" }}>Success Rate</span>
              </div>
              <div style={{ width: "100%", height: "8px", background: "var(--border-default)", borderRadius: "4px", overflow: "hidden", marginTop: "8px" }}>
                <div style={{ width: `${successRate}%`, height: "100%", background: successRate > 90 ? "var(--success-color)" : successRate > 70 ? "var(--warning-color)" : "var(--error-color)", borderRadius: "4px" }} />
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: "var(--space-5)", flex: 1 }}>
            <h2 style={{ fontSize: "16px", margin: "0 0 var(--space-4)" }}>Recent Activity</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
              {recentActivities.map((activity, idx) => {
                const pName = projectNameById[activity.project_id] || "Unknown";
                return (
                  <div key={idx} style={{ display: "flex", gap: "var(--space-3)" }}>
                    <div style={{ position: "relative" }}>
                      <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "var(--bg-hover)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)", zIndex: 2, position: "relative" }}>
                         {activity.status === "running" ? <Zap size={16} color="var(--success-color)" /> : <CheckCircle2 size={16} />}
                      </div>
                      {idx !== recentActivities.length - 1 && (
                        <div style={{ position: "absolute", top: "32px", bottom: "-16px", left: "15px", width: "2px", background: "var(--border-default)" }} />
                      )}
                    </div>
                    <div style={{ flex: 1, paddingBottom: "var(--space-2)" }}>
                      <p style={{ margin: "0 0 2px", fontSize: "14px", color: "var(--text-primary)", fontWeight: 500 }}>
                        Deployment {activity.status}
                      </p>
                      <p style={{ margin: 0, fontSize: "13px", color: "var(--text-secondary)" }}>
                        {pName} • v{activity.version}
                      </p>
                      <span style={{ fontSize: "12px", color: "var(--text-tertiary)", marginTop: "4px", display: "block" }}>
                        {timeAgo(activity.created_at)}
                      </span>
                    </div>
                  </div>
                );
              })}
              {recentActivities.length === 0 && (
                <div style={{ textAlign: "center", color: "var(--text-secondary)", padding: "var(--space-4) 0" }}>
                  No recent activity
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

import { useEffect, useState } from "react";
import axios from "axios";
import {
    Users,
    Database,
    BarChart,
    ExternalLink,
    ShieldAlert,
    ArrowLeft,
    ChevronRight,
    Loader2,
    Lock,
    Search,
    CheckCircle2,
    XCircle
} from "lucide-react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from "recharts";

const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

export function AdminDashboard({ onBack }) {
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchData = async () => {
        setLoading(true);
        const token = localStorage.getItem("calaro_token");
        const config = {
            headers: { Authorization: `Bearer ${token}` },
        };

        try {
            const [statsRes, usersRes, logsRes] = await Promise.all([
                axios.get(`${API_URL}/admin/stats`, config),
                axios.get(`${API_URL}/admin/users`, config),
                axios.get(`${API_URL}/admin/logs`, config),
            ]);

            setStats(statsRes.data);
            setUsers(usersRes.data);
            setLogs(logsRes.data);
        } catch (err) {
            setError(err?.response?.data?.detail || "Failed to load admin data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (loading) return (
        <div className="app-loading">
            <Loader2 className="spinner" size={48} />
            <p>Initializing Admin Control...</p>
        </div>
    );

    return (
        <div className="app-shell" style={{ gridTemplateColumns: "1fr" }}>
            <main className="main" style={{ maxWidth: "1200px" }}>
                <header className="header-row" style={{ marginBottom: "2rem" }}>
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "1rem", color: "var(--accent-active)", marginBottom: "0.5rem" }}>
                            <Lock size={18} /> <span style={{ textTransform: "uppercase", fontSize: "0.8rem", fontWeight: "800", letterSpacing: "0.1em" }}>Secure Zone</span>
                        </div>
                        <h2>Admin Control</h2>
                    </div>
                    <button onClick={onBack} className="secondary-btn" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <ArrowLeft size={18} /> Back to App
                    </button>
                </header>

                {error && (
                    <div className="panel" style={{ borderColor: "#ef4444", background: "rgba(239, 68, 68, 0.05)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "1rem", color: "#ef4444" }}>
                            <ShieldAlert size={24} />
                            <p style={{ fontWeight: "700" }}>{error}</p>
                        </div>
                    </div>
                )}

                <div className="stats-grid">
                    <div className="panel">
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
                            <Users color="var(--accent-secondary)" />
                            <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>+12% vs last month</span>
                        </div>
                        <h4 style={{ color: "var(--text-secondary)", fontSize: "0.9rem", textTransform: "uppercase" }}>Total Users</h4>
                        <div style={{ fontSize: "2.5rem", fontWeight: "800" }}>{stats?.total_users || 0}</div>
                    </div>
                    <div className="panel">
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
                            <Database color="var(--accent-primary)" />
                        </div>
                        <h4 style={{ color: "var(--text-secondary)", fontSize: "0.9rem", textTransform: "uppercase" }}>Food Logs Cache</h4>
                        <div style={{ fontSize: "2.5rem", fontWeight: "800" }}>{stats?.total_food_logs || 0}</div>
                    </div>
                    <div className="panel">
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
                            <BarChart color="var(--accent-vibrant)" />
                        </div>
                        <h4 style={{ color: "var(--text-secondary)", fontSize: "0.9rem", textTransform: "uppercase" }}>Avg Caloric Load</h4>
                        <div style={{ fontSize: "2.5rem", fontWeight: "800" }}>{stats?.average_calories_per_log ? Math.round(stats.average_calories_per_log) : 0} <span style={{ fontSize: "1rem", opacity: 0.6 }}>kcal</span></div>
                    </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "2rem", marginBottom: "3rem" }}>
                    <section className="panel" style={{ minHeight: "350px" }}>
                        <div className="panel-header">
                            <h3>Real-time Analytics</h3>
                            <p>Aggregated user engagement over time.</p>
                        </div>
                        <div style={{ width: "100%", height: "250px", marginTop: "1rem" }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={logs.slice(0, 7).reverse().map((l, i) => ({ name: i, value: l.total_calories }))}>
                                    <defs>
                                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--accent-secondary)" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="var(--accent-secondary)" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                    <XAxis dataKey="name" hide />
                                    <YAxis hide />
                                    <Tooltip
                                        contentStyle={{ background: "#0f172a", border: "1px solid var(--glass-border)", borderRadius: "8px" }}
                                        labelStyle={{ display: "none" }}
                                    />
                                    <Area type="monotone" dataKey="value" stroke="var(--accent-secondary)" fillOpacity={1} fill="url(#colorValue)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </section>

                    <section className="panel">
                        <div className="panel-header">
                            <h3>External Monitoring</h3>
                            <p>Advanced system node diagnostics.</p>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                            {[
                                { name: "Grafana Dashboards", url: "http://localhost:3000", color: "#F46036" },
                                { name: "Prometheus Metrics", url: "http://localhost:9090", color: "#e64415" },
                                { name: "SQLite Adminer", url: "http://localhost:8080", color: "#3fb950" }
                            ].map(link => (
                                <a
                                    key={link.name}
                                    href={link.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        padding: "1.25rem",
                                        background: "rgba(255,255,255,0.03)",
                                        borderRadius: "1rem",
                                        textDecoration: "none",
                                        color: "white",
                                        border: "1px solid var(--glass-border)",
                                        transition: "var(--transition)"
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = "var(--glass-bg)"}
                                    onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.03)"}
                                >
                                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                        <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: link.color }} />
                                        <span style={{ fontWeight: "700" }}>{link.name}</span>
                                    </div>
                                    <ExternalLink size={16} opacity={0.6} />
                                </a>
                            ))}
                        </div>
                    </section>
                </div>

                <div className="panel">
                    <div className="panel-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                            <h3>Registered Personnel</h3>
                            <p>Manage access and user roles.</p>
                        </div>
                        <div className="glass-card" style={{ padding: "0.5rem 1rem", borderRadius: "999px", display: "flex", alignItems: "center", gap: "0.5rem", border: "1px solid var(--glass-border)", background: "var(--glass-bg)" }}>
                            <Search size={16} opacity={0.5} />
                            <input placeholder="Search users..." style={{ background: "none", border: "none", color: "white", outline: "none", fontSize: "0.9rem" }} />
                        </div>
                    </div>

                    <div style={{ overflowX: "auto", marginTop: "2rem" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                                <tr style={{ textAlign: "left", color: "var(--text-secondary)", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                                    <th style={{ padding: "1rem" }}>Status</th>
                                    <th style={{ padding: "1rem" }}>User Details</th>
                                    <th style={{ padding: "1rem" }}>Privileges</th>
                                    <th style={{ padding: "1rem" }}>Last Active</th>
                                    <th style={{ padding: "1rem" }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(u => (
                                    <tr key={u.id} style={{ borderBottom: "1px solid var(--glass-border)" }}>
                                        <td style={{ padding: "1.5rem 1rem" }}>
                                            {u.is_active ? <CheckCircle2 size={18} color="var(--accent-primary)" /> : <XCircle size={18} color="#ef4444" />}
                                        </td>
                                        <td style={{ padding: "1.5rem 1rem" }}>
                                            <div style={{ fontWeight: "700" }}>{u.full_name || "N/A"}</div>
                                            <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>{u.email}</div>
                                        </td>
                                        <td style={{ padding: "1.5rem 1rem" }}>
                                            {u.is_admin ? (
                                                <span style={{ padding: "0.4rem 0.8rem", borderRadius: "999px", background: "rgba(251, 191, 36, 0.1)", color: "var(--accent-active)", fontSize: "0.8rem", fontWeight: "800", border: "1px solid rgba(251, 191, 36, 0.2)" }}>ADMIN</span>
                                            ) : (
                                                <span style={{ padding: "0.4rem 0.8rem", borderRadius: "999px", background: "rgba(255,255,255,0.05)", color: "var(--text-secondary)", fontSize: "0.8rem", fontWeight: "700" }}>USER</span>
                                            )}
                                        </td>
                                        <td style={{ padding: "1.5rem 1rem", fontSize: "0.9rem", color: "var(--text-secondary)" }}>
                                            Just now
                                        </td>
                                        <td style={{ padding: "1.5rem 1rem" }}>
                                            <button className="glass-card" style={{ padding: "0.5rem", borderRadius: "8px", background: "var(--glass-bg)", border: "1px solid var(--glass-border)", color: "white", cursor: "pointer" }}>
                                                Manage
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}

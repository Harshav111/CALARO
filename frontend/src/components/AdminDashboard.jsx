import { useEffect, useState } from "react";
import axios from "axios";

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

    if (loading) return <div className="p-8 text-center">Loading admin data...</div>;
    if (error) return <div className="p-8 text-red-500 text-center">{error}</div>;

    return (
        <div className="admin-shell">
            <header className="admin-header">
                <button onClick={onBack} className="back-btn">← Back to App</button>
                <h1>Admin Control Center</h1>
            </header>

            <div className="admin-grid">
                <section className="stats-overview">
                    <div className="stat-card">
                        <h3>Total Users</h3>
                        <p className="big-number">{stats.total_users}</p>
                    </div>
                    <div className="stat-card">
                        <h3>Food Logs</h3>
                        <p className="big-number">{stats.total_food_logs}</p>
                    </div>
                    <div className="stat-card">
                        <h3>Avg Calories</h3>
                        <p className="big-number">{stats.average_calories_per_log} kcal</p>
                    </div>
                    <div className="stat-card external-links">
                        <h3>Monitoring</h3>
                        <div className="links-row">
                            <a href="http://localhost:3000" target="_blank" rel="noreferrer" className="tag grafana">Grafana</a>
                            <a href="http://localhost:9090" target="_blank" rel="noreferrer" className="tag prometheus">Prometheus</a>
                            <a href="http://localhost:8080" target="_blank" rel="noreferrer" className="tag adminer">Adminer (DB)</a>
                        </div>
                    </div>
                </section>

                <section className="admin-table-section">
                    <h2>Registered Users</h2>
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Admin</th>
                                    <th>Active</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(u => (
                                    <tr key={u.id}>
                                        <td>{u.id}</td>
                                        <td>{u.full_name || "-"}</td>
                                        <td>{u.email}</td>
                                        <td>{u.is_admin ? "✅" : "❌"}</td>
                                        <td>{u.is_active ? "✅" : "❌"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                <section className="admin-table-section">
                    <h2>Recent Global Activity</h2>
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>Time</th>
                                    <th>User ID</th>
                                    <th>Meal Description</th>
                                    <th>Calories</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map(l => (
                                    <tr key={l.id}>
                                        <td>{new Date(l.created_at).toLocaleString()}</td>
                                        <td>{l.user_id}</td>
                                        <td>{l.raw_text}</td>
                                        <td>{l.total_calories}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </div>
    );
}

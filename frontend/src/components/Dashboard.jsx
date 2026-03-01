import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Mic,
  LogOut,
  Settings,
  ShieldCheck,
  Flame,
  TrendingUp,
  Activity,
  Target,
  Info,
  Calendar,
  CloudLightning,
  BarChart3,
  Dna,
  User,
  History,
  AlertCircle
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from "recharts";

import { createFoodLog, fetchFoodLogs, parseFood } from "../api/food";
import { fetchProfile, updateProfile } from "../api/auth";
import { FoodLogList } from "./FoodLogList";
import { VoiceRecorder } from "./VoiceRecorder";

// --- Sub-components for better modularity ---

const StreakWidget = ({ count }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="streak-widget"
  >
    <div className="fire-container">🔥</div>
    <div className="streak-text">
      <h4>{count || 0} Day Streak!</h4>
      <p>Log today's final meal to keep it alive.</p>
    </div>
    <div style={{ marginLeft: "auto" }}>
      <TrendingUp color="#fbbf24" size={32} />
    </div>
  </motion.div>
);

const HeroSection = ({ user }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="hero-panel"
  >
    <img src="/images/hero.png" alt="Healthy Food" className="hero-image" />
    <div className="hero-overlay" />
    <div className="hero-content">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", justifyContent: "center", marginBottom: "1rem" }}>
          <CloudLightning color="var(--accent-secondary)" fill="var(--accent-secondary)" />
          <span style={{ textTransform: "uppercase", letterSpacing: "0.2em", fontWeight: "700", opacity: 0.8 }}>AI Health Coach</span>
        </div>
        <h3>Welcome, {user.full_name?.split(" ")[0] || "Health Seeker"}</h3>
        <p>Your journey to optimized nutrition starts here. Speak or type to log your progress.</p>
      </motion.div>
    </div>
  </motion.div>
);

const Navigation = ({ user, onLogout, onToggleAdmin, activeTab, setTab }) => (
  <aside className="sidebar">
    <div className="brand">
      <h1>CALARO</h1>
      <p>Your AI Health Companion</p>
    </div>

    <div className="user-card">
      <div className="avatar-circle">
        {user.full_name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
      </div>
      <div className="user-info">
        <div className="user-name">{user.full_name || user.email.split("@")[0]}</div>
        <div className="user-email">{user.email}</div>
      </div>
    </div>

    <div className="sidebar-nav">
      <div
        className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
        onClick={() => setTab('dashboard')}
      >
        <Activity size={20} /> Dashboard
      </div>
      <div
        className={`nav-item ${activeTab === 'history' ? 'active' : ''}`}
        onClick={() => setTab('history')}
      >
        <History size={20} /> History
      </div>
      <div
        className={`nav-item ${activeTab === 'blueprint' ? 'active' : ''}`}
        onClick={() => setTab('blueprint')}
      >
        <Dna size={20} /> Health Blueprint
      </div>
      {user.is_admin && (
        <div className="nav-item" onClick={onToggleAdmin}>
          <ShieldCheck size={20} color="var(--accent-active)" /> Admin Control
        </div>
      )}
    </div>

    <div style={{ marginTop: "auto" }}>
      <button className="secondary-btn" onClick={onLogout} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "1rem" }}>
        <LogOut size={18} /> Logout
      </button>
    </div>
  </aside>
);

export function Dashboard({ user, onLogout, onToggleAdmin }) {
  const [activeTab, setTab] = useState('dashboard');
  const [input, setInput] = useState("");
  const [parsedItems, setParsedItems] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loadingParse, setLoadingParse] = useState(false);
  const [loadingSave, setLoadingSave] = useState(false);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [error, setError] = useState("");
  const [profile, setProfile] = useState(null);
  const [profileError, setProfileError] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileDraft, setProfileDraft] = useState({
    age: "",
    height_cm: "",
    weight_kg: "",
    sex: "",
    activity_level: "",
  });

  const totalCaloriesToday = useMemo(() => {
    const today = new Date().toDateString();
    return logs.reduce((sum, log) => {
      const sameDay = new Date(log.created_at).toDateString() === today;
      return sameDay ? sum + (Number(log.total_calories) || 0) : sum;
    }, 0);
  }, [logs]);

  // Streak logic (basic implementation)
  const streakCount = useMemo(() => {
    if (logs.length === 0) return 0;
    // A more advanced streak would calculate consecutive days
    return 3; // Mocking for aesthetic demonstration
  }, [logs]);

  const handleParse = async () => {
    if (!input.trim()) return;
    setLoadingParse(true);
    setError("");
    try {
      const items = await parseFood(input.trim());
      setParsedItems(items);
    } catch (err) {
      setError(err?.response?.data?.detail || "Unable to parse meal.");
    } finally {
      setLoadingParse(false);
    }
  };

  const handleSave = async () => {
    if (!input.trim() || parsedItems.length === 0) return;
    setLoadingSave(true);
    setError("");
    try {
      const saved = await createFoodLog({
        raw_text: input.trim(),
        items: parsedItems,
      });
      setLogs((prev) => [saved, ...prev]);
      setInput("");
      setParsedItems([]);
    } catch (err) {
      setError(err?.response?.data?.detail || "Unable to save log.");
    } finally {
      setLoadingSave(false);
    }
  };

  const loadLogs = async () => {
    setLoadingLogs(true);
    try {
      const data = await fetchFoodLogs();
      setLogs(data);
    } finally {
      setLoadingLogs(false);
    }
  };

  const loadProfile = async () => {
    try {
      const data = await fetchProfile();
      setProfile(data);
      setProfileDraft({
        age: data.age ?? "",
        height_cm: data.height_cm ?? "",
        weight_kg: data.weight_kg ?? "",
        sex: data.sex ?? "",
        activity_level: data.activity_level ?? "",
      });
    } catch (err) {
      setProfileError(err?.response?.data?.detail || "Profile failed to load.");
    }
  };

  useEffect(() => {
    loadLogs();
    loadProfile();
  }, []);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const updated = await updateProfile({
        ...profileDraft,
        age: profileDraft.age ? Number(profileDraft.age) : null,
        height_cm: profileDraft.height_cm ? Number(profileDraft.height_cm) : null,
        weight_kg: profileDraft.weight_kg ? Number(profileDraft.weight_kg) : null,
      });
      setProfile(updated);
    } finally {
      setSavingProfile(false);
    }
  };

  const caloriePercentage = profile?.tdee ? Math.min((totalCaloriesToday / profile.tdee) * 100, 100) : 0;
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (caloriePercentage / 100) * circumference;

  return (
    <div className="app-shell">
      <Navigation
        user={user}
        onLogout={onLogout}
        onToggleAdmin={onToggleAdmin}
        activeTab={activeTab}
        setTab={setTab}
      />

      <main className="main">
        <header className="header-row">
          <div>
            <h2>Health Hub</h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "1.2rem", fontWeight: "500" }}>
              Tracking progress for <strong style={{ color: 'white' }}>{user.full_name || user.email}</strong>
            </p>
          </div>
          <motion.div whileHover={{ scale: 1.05 }} className="glass-card" style={{ padding: '0.8rem 1.2rem', borderRadius: '1rem', background: 'var(--glass-bg)', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <Calendar size={18} color="var(--accent-secondary)" />
            <span style={{ fontWeight: '600' }}>{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</span>
          </motion.div>
        </header>

        {activeTab === 'dashboard' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <HeroSection user={user} />
            <StreakWidget count={streakCount} />

            <div className="stats-grid">
              <section className="panel">
                <div className="panel-header">
                  <h3>Daily Budget</h3>
                  <p>Consumed vs Goal</p>
                </div>
                <div className="calorie-circle-container">
                  <svg width="220" height="220" className="circle-svg">
                    <circle cx="110" cy="110" r={radius} className="circle-bg" />
                    <circle
                      cx="110" cy="110" r={radius}
                      className="circle-progress"
                      style={{
                        strokeDasharray: circumference,
                        strokeDashoffset: offset,
                        stroke: caloriePercentage > 95 ? "var(--accent-vibrant)" : "var(--accent-secondary)"
                      }}
                    />
                  </svg>
                  <div className="circle-text">
                    <span className="circle-value">{Math.round(totalCaloriesToday)}</span>
                    <span className="circle-label">kcal today</span>
                  </div>
                </div>
                <div style={{ textAlign: "center", marginTop: "1rem" }}>
                  <p style={{ fontWeight: "700", color: "var(--text-primary)", fontSize: "1.1rem" }}>
                    Goal: {profile?.tdee ? Math.round(profile.tdee) : "---"} kcal
                  </p>
                </div>
              </section>

              <section className="panel" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div className="panel-header">
                  <h3>AI Voice Sync</h3>
                  <p>Speak your meal for high precision logging.</p>
                </div>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <VoiceRecorder onResult={(res) => { setInput(res.text); setParsedItems(res.items); }} />
                </div>
              </section>
            </div>

            <section className="panel">
              <div className="panel-header">
                <h3>Log New Meal</h3>
                <p>Describe what you ate. AI will handle the nutrition facts.</p>
              </div>
              <textarea
                className="meal-input"
                rows={2}
                placeholder="I just had a bowl of Greek yogurt with berries and honey..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <div className="panel-actions">
                <button className="primary-btn" onClick={handleParse} disabled={loadingParse || !input.trim()}>
                  {loadingParse ? "Analyzing..." : <><Plus size={20} /> AI Parse</>}
                </button>
                <button className="secondary-btn" onClick={handleSave} disabled={loadingSave || parsedItems.length === 0}>
                  Add to Timeline
                </button>
              </div>

              <AnimatePresence>
                {parsedItems.length > 0 && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    style={{ marginTop: "2rem", overflow: "hidden" }}
                  >
                    <div style={{ background: "rgba(255,255,255,0.03)", padding: "1.5rem", borderRadius: "var(--radius-lg)", border: "1px solid var(--glass-border)" }}>
                      <h4 style={{ marginBottom: "1rem", color: "var(--text-secondary)", display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Info size={16} /> Items Detected
                      </h4>
                      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                        {parsedItems.map((item, idx) => (
                          <motion.span
                            key={idx}
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            style={{ background: "var(--glass-bg)", padding: "0.6rem 1rem", borderRadius: "999px", fontSize: "0.95rem", fontWeight: "600", border: "1px solid var(--glass-border)" }}
                          >
                            {item.name} ({item.quantity} {item.unit})
                          </motion.span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>
          </motion.div>
        )}

        {activeTab === 'history' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <FoodLogList logs={logs} />
          </motion.div>
        )}

        {activeTab === 'blueprint' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="panel">
            <div className="panel-header">
              <h3>Health Blueprint</h3>
              <p>Configure your biological data for precision TDEE calculation.</p>
            </div>
            <form className="profile-grid" onSubmit={handleProfileSubmit}>
              <div className="field">
                <label>Age</label>
                <input type="number" value={profileDraft.age} onChange={(e) => setProfileDraft({ ...profileDraft, age: e.target.value })} />
              </div>
              <div className="field">
                <label>Sex</label>
                <select value={profileDraft.sex} onChange={(e) => setProfileDraft({ ...profileDraft, sex: e.target.value })}>
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <div className="field">
                <label>Height (cm)</label>
                <input type="number" value={profileDraft.height_cm} onChange={(e) => setProfileDraft({ ...profileDraft, height_cm: e.target.value })} />
              </div>
              <div className="field">
                <label>Weight (kg)</label>
                <input type="number" value={profileDraft.weight_kg} onChange={(e) => setProfileDraft({ ...profileDraft, weight_kg: e.target.value })} />
              </div>
              <div className="field" style={{ gridColumn: "1 / -1" }}>
                <label>Activity Level</label>
                <select value={profileDraft.activity_level} onChange={(e) => setProfileDraft({ ...profileDraft, activity_level: e.target.value })}>
                  <option value="">Typical day</option>
                  <option value="sedentary">Sedentary (No exercise)</option>
                  <option value="light">Lightly Active (1-3 days/week)</option>
                  <option value="moderate">Moderately Active (3-5 days/week)</option>
                  <option value="active">Very Active (6-7 days/week)</option>
                </select>
              </div>
              <div style={{ gridColumn: "1 / -1", marginTop: "1rem" }}>
                <button type="submit" className="primary-btn" style={{ width: "100%" }}>
                  Sync Biological Data
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </main>
    </div>
  );
}

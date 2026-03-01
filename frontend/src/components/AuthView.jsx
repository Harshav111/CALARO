import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LogIn, UserPlus, Mail, Lock, ShieldCheck, Sparkles, Loader2 } from "lucide-react";

export function AuthView({ onAuthenticated, isLoading }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await onAuthenticated(mode, form);
    } catch (err) {
      setError(err?.response?.data?.detail || "Authentication encounter an issue.");
    }
  };

  return (
    <div className="auth-shell" style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-gradient)' }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="panel"
        style={{ width: '100%', maxWidth: '480px', padding: '3.5rem', boxShadow: '0 40px 100px rgba(0,0,0,0.5)' }}
      >
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <div style={{ display: "inline-flex", padding: "1rem", background: "var(--glass-accent)", borderRadius: "1.5rem", marginBottom: "1.5rem", border: "1px solid var(--glass-border)" }}>
            <ShieldCheck size={48} color="var(--accent-secondary)" />
          </div>
          <h1 style={{ fontSize: "3rem", fontWeight: "800", background: "linear-gradient(135deg, #fff, #94a3b8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", letterSpacing: "-0.04em" }}>CALARO</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem", fontWeight: "500" }}>Your journey to a healthier you starts here.</p>
        </div>

        <div style={{ display: "flex", gap: "0.5rem", background: "rgba(255,255,255,0.03)", padding: "0.4rem", borderRadius: "1rem", border: "1px solid var(--glass-border)", marginBottom: "2.5rem" }}>
          <button
            className={`nav-item ${mode === "login" ? "active" : ""}`}
            style={{ flex: 1, justifyContent: "center", padding: "0.8rem" }}
            onClick={() => setMode("login")}
          >
            <LogIn size={18} /> Log In
          </button>
          <button
            className={`nav-item ${mode === "register" ? "active" : ""}`}
            style={{ flex: 1, justifyContent: "center", padding: "0.8rem" }}
            onClick={() => setMode("register")}
          >
            <UserPlus size={18} /> Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <AnimatePresence mode="wait">
            {mode === "register" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="field"
              >
                <label><span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Sparkles size={14} /> Full Name</span></label>
                <input
                  name="full_name"
                  type="text"
                  placeholder="John Doe"
                  value={form.full_name}
                  onChange={handleChange}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="field">
            <label><span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Mail size={14} /> Email Address</span></label>
            <input
              name="email"
              type="email"
              placeholder="you@energy.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="field">
            <label><span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Lock size={14} /> Security Phrase</span></label>
            <input
              name="password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              minLength={8}
              required
            />
          </div>

          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: '0.8rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '0.8rem', fontSize: '0.9rem', fontWeight: '600', border: '1px solid rgba(239, 68, 68, 0.2)', textAlign: 'center' }}>
              {error}
            </motion.div>
          )}

          <button className="primary-btn" type="submit" disabled={isLoading} style={{ width: '100%', marginTop: '1rem' }}>
            {isLoading ? <Loader2 className="animate-spin" /> : mode === "login" ? "Enter Dashboard" : "Create Master Account"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

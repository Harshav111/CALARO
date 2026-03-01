import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LogIn, UserPlus, Mail, Lock, ShieldCheck, Sparkles, Loader2, KeyRound } from "lucide-react";
import { requestPasswordReset, resetPassword } from "../api/auth";

export function AuthView({ onAuthenticated, isLoading }) {
  const [mode, setMode] = useState("login"); // 'login', 'register', 'forgot_password', 'verify_otp'
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    otp: "",
  });
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [localLoading, setLocalLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (mode === "login" || mode === "register") {
      try {
        await onAuthenticated(mode, form);
      } catch (err) {
        setError(err?.response?.data?.detail || "Authentication encounter an issue.");
      }
    } else if (mode === "forgot_password") {
      setLocalLoading(true);
      try {
        const res = await requestPasswordReset(form.email);
        setSuccessMsg(res.msg || "OTP sent if email exists.");
        setMode("verify_otp");
      } catch (err) {
        setError(err?.response?.data?.detail || "Could not request OTP.");
      } finally {
        setLocalLoading(false);
      }
    } else if (mode === "verify_otp") {
      setLocalLoading(true);
      try {
        const res = await resetPassword(form.email, form.otp, form.password);
        setSuccessMsg(res.msg || "Password reset successfully! You can now log in.");
        setMode("login");
      } catch (err) {
        setError(err?.response?.data?.detail || "Could not reset password.");
      } finally {
        setLocalLoading(false);
      }
    }
  };

  const isFormLoading = isLoading || localLoading;

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

        {(mode === 'login' || mode === 'register') && (
          <div style={{ display: "flex", gap: "0.5rem", background: "rgba(255,255,255,0.03)", padding: "0.4rem", borderRadius: "1rem", border: "1px solid var(--glass-border)", marginBottom: "2.5rem" }}>
            <button
              className={`nav-item ${mode === "login" ? "active" : ""}`}
              style={{ flex: 1, justifyContent: "center", padding: "0.8rem" }}
              type="button"
              onClick={() => { setMode("login"); setError(""); setSuccessMsg(""); }}
            >
              <LogIn size={18} /> Log In
            </button>
            <button
              className={`nav-item ${mode === "register" ? "active" : ""}`}
              style={{ flex: 1, justifyContent: "center", padding: "0.8rem" }}
              type="button"
              onClick={() => { setMode("register"); setError(""); setSuccessMsg(""); }}
            >
              <UserPlus size={18} /> Sign Up
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <AnimatePresence mode="wait">
            {mode === "register" && (
              <motion.div
                key="register-name"
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

            {(mode === "verify_otp") && (
              <motion.div
                key="verify-otp"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="field"
              >
                <label><span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><KeyRound size={14} /> Reset Code (OTP)</span></label>
                <input
                  name="otp"
                  type="text"
                  placeholder="123456"
                  value={form.otp}
                  onChange={handleChange}
                  required
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
              disabled={mode === 'verify_otp'}
              required
            />
          </div>

          {(mode === "login" || mode === "register" || mode === "verify_otp") && (
            <div className="field">
              <label><span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Lock size={14} /> {mode === 'verify_otp' ? 'New Password' : 'Security Phrase'}</span></label>
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
          )}

          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: '0.8rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '0.8rem', fontSize: '0.9rem', fontWeight: '600', border: '1px solid rgba(239, 68, 68, 0.2)', textAlign: 'center' }}>
              {error}
            </motion.div>
          )}

          {successMsg && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: '0.8rem', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-primary)', borderRadius: '0.8rem', fontSize: '0.9rem', fontWeight: '600', border: '1px solid rgba(16, 185, 129, 0.2)', textAlign: 'center' }}>
              {successMsg}
            </motion.div>
          )}

          <button className="primary-btn" type="submit" disabled={isFormLoading} style={{ width: '100%', marginTop: '1rem' }}>
            {isFormLoading ? <Loader2 className="animate-spin" /> :
              mode === "login" ? "Enter Dashboard" :
                mode === "register" ? "Create Master Account" :
                  mode === "forgot_password" ? "Send Reset Code" :
                    "Confirm New Password"
            }
          </button>

          {mode === "login" && (
            <p style={{ textAlign: 'center', marginTop: '1rem', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '0.9rem' }} onClick={() => { setMode("forgot_password"); setError(""); setSuccessMsg(""); }}>
              Forgot your password?
            </p>
          )}

          {(mode === "forgot_password" || mode === "verify_otp") && (
            <p style={{ textAlign: 'center', marginTop: '1rem', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '0.9rem' }} onClick={() => { setMode("login"); setError(""); setSuccessMsg(""); }}>
              Back to Login
            </p>
          )}
        </form>
      </motion.div>
    </div>
  );
}

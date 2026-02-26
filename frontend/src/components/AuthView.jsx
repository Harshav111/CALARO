import { useState } from "react";

export function AuthView({ onAuthenticated, isLoading }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    await onAuthenticated(mode, form).catch((err) => {
      const message =
        err?.response?.data?.detail ||
        "Something went wrong. Please try again.";
      setError(message);
    });
  };

  return (
    <div className="auth-shell">
      <div className="auth-card glass">
        <div className="auth-header">
          <h1>Calaro</h1>
          <p>Secure AI-powered calorie tracking.</p>
        </div>

        <div className="auth-toggle">
          <button
            type="button"
            className={mode === "login" ? "active" : ""}
            onClick={() => setMode("login")}
          >
            Log In
          </button>
          <button
            type="button"
            className={mode === "register" ? "active" : ""}
            onClick={() => setMode("register")}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {mode === "register" && (
            <div className="field">
              <label htmlFor="full_name">Name</label>
              <input
                id="full_name"
                name="full_name"
                type="text"
                autoComplete="name"
                placeholder="Your name"
                value={form.full_name}
                onChange={handleChange}
              />
            </div>
          )}

          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete={
                mode === "login" ? "current-password" : "new-password"
              }
              placeholder="Minimum 8 characters"
              value={form.password}
              onChange={handleChange}
              minLength={8}
              required
            />
          </div>

          {error && <div className="error-banner">{error}</div>}

          <button className="primary-btn" type="submit" disabled={isLoading}>
            {isLoading
              ? "Please wait..."
              : mode === "login"
              ? "Log In"
              : "Create Account"}
          </button>
        </form>
      </div>
    </div>
  );
}


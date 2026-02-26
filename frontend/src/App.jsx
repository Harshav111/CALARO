import { useEffect, useState } from "react";

import "./App.css";
import { fetchMe, loginUser, registerUser } from "./api/auth";
import { AuthView } from "./components/AuthView";
import { Dashboard } from "./components/Dashboard";
import { AdminDashboard } from "./components/AdminDashboard";

function App() {
  const [user, setUser] = useState(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem("calaro_token");
      if (!token) {
        setInitializing(false);
        return;
      }
      try {
        const me = await fetchMe();
        setUser(me);
      } catch {
        localStorage.removeItem("calaro_token");
      } finally {
        setInitializing(false);
      }
    };
    loadUser();
  }, []);

  const handleAuth = async (mode, form) => {
    setAuthLoading(true);
    try {
      if (mode === "register") {
        await registerUser({
          email: form.email,
          password: form.password,
          full_name: form.full_name || null,
        });
      }
      const tokenResponse = await loginUser({
        email: form.email,
        password: form.password,
      });
      localStorage.setItem("calaro_token", tokenResponse.access_token);
      const me = await fetchMe();
      setUser(me);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("calaro_token");
    setUser(null);
  };

  if (initializing) {
    return (
      <div className="app-loading">
        <div className="spinner" />
        <p>Booting up Calaro...</p>
      </div>
    );
  }

  if (!user) {
    return <AuthView onAuthenticated={handleAuth} isLoading={authLoading} />;
  }

  if (showAdmin && user.is_admin) {
    return <AdminDashboard onBack={() => setShowAdmin(false)} />;
  }

  return (
    <Dashboard
      user={user}
      onLogout={handleLogout}
      onToggleAdmin={() => setShowAdmin(true)}
    />
  );
}

export default App;

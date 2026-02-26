import { useEffect, useMemo, useState } from "react";

import { createFoodLog, fetchFoodLogs, parseFood } from "../api/food";
import { fetchProfile, updateProfile } from "../api/auth";
import { FoodLogList } from "./FoodLogList";
import { VoiceRecorder } from "./VoiceRecorder";

export function Dashboard({ user, onLogout, onToggleAdmin }) {
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
      const sameDay =
        new Date(log.created_at).toDateString() === today &&
        typeof log.total_calories === "number";
      return sameDay ? sum + log.total_calories : sum;
    }, 0);
  }, [logs]);

  const handleParse = async () => {
    if (!input.trim()) return;
    setLoadingParse(true);
    setError("");
    try {
      const items = await parseFood(input.trim());
      setParsedItems(items);
    } catch (err) {
      const message =
        err?.response?.data?.detail ||
        "Unable to parse meal. Check your API key.";
      setError(message);
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
      const message =
        err?.response?.data?.detail ||
        "Unable to save log. Please try again.";
      setError(message);
    } finally {
      setLoadingSave(false);
    }
  };

  const loadLogs = async () => {
    setLoadingLogs(true);
    setError("");
    try {
      const data = await fetchFoodLogs();
      setLogs(data);
    } catch (err) {
      const message =
        err?.response?.data?.detail ||
        "Unable to load logs. Please try again.";
      setError(message);
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    const bootstrap = async () => {
      await Promise.all([loadLogs(), loadProfile()]);
    };
    bootstrap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadProfile = async () => {
    setProfileError("");
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
      const message =
        err?.response?.data?.detail ||
        "Unable to load profile. You can still log meals.";
      setProfileError(message);
    }
  };

  const handleProfileChange = (event) => {
    const { name, value } = event.target;
    setProfileDraft((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    setSavingProfile(true);
    setProfileError("");
    try {
      const payload = {
        age: profileDraft.age ? Number(profileDraft.age) : null,
        height_cm: profileDraft.height_cm ? Number(profileDraft.height_cm) : null,
        weight_kg: profileDraft.weight_kg ? Number(profileDraft.weight_kg) : null,
        sex: profileDraft.sex || null,
        activity_level: profileDraft.activity_level || null,
      };
      const updated = await updateProfile(payload);
      setProfile(updated);
      setProfileDraft({
        age: updated.age ?? "",
        height_cm: updated.height_cm ?? "",
        weight_kg: updated.weight_kg ?? "",
        sex: updated.sex ?? "",
        activity_level: updated.activity_level ?? "",
      });
    } catch (err) {
      const message =
        err?.response?.data?.detail ||
        "Unable to update profile. Please try again.";
      setProfileError(message);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleVoiceResult = (result) => {
    setInput(result.text || "");
    setParsedItems(result.items || []);
  };

  return (
    <div className="app-shell">
      <aside className="sidebar glass">
        <div className="brand">
          <h1>Calaro</h1>
          <p>Secure AI calorie assistant</p>
        </div>
        <div className="user-card">
          <div className="avatar-circle">
            {user.full_name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
          </div>
          <div>
            <div className="user-name">
              {user.full_name || user.email.split("@")[0]}
            </div>
            <div className="user-email">{user.email}</div>
          </div>
        </div>
        <div className="stats-card">
          <p className="label">Today&apos;s intake</p>
          <p className="value">
            {Math.round(totalCaloriesToday)} <span>kcal</span>
          </p>
          {profile?.tdee && (
            <p className="subvalue">
              vs&nbsp;
              <strong>{Math.round(profile.tdee)} kcal</strong> target
            </p>
          )}
        </div>
        <button className="secondary-btn" onClick={onLogout}>
          Log out
        </button>
        {user.is_admin && (
          <button
            className="admin-link-btn"
            onClick={() => onBack ? onBack() : (onToggleAdmin && onToggleAdmin())}
            style={{ marginTop: "1rem", background: "rgba(255, 255, 255, 0.1)", border: "1px solid rgba(255, 255, 255, 0.2)", color: "#fff", width: "100%", padding: "0.75rem", borderRadius: "8px", cursor: "pointer", fontWeight: "600" }}
          >
            🛡️ Admin Panel
          </button>
        )}
      </aside>

      <main className="main">
        <VoiceRecorder onResult={handleVoiceResult} />

        <section className="panel">
          <div className="panel-header">
            <h2>Describe your meal</h2>
            <p>Natural language is fine. We&apos;ll handle the parsing.</p>
          </div>
          <textarea
            className="meal-input"
            rows={3}
            placeholder="E.g. I had two idlis with sambar and a cup of filter coffee..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <div className="panel-actions">
            <button
              type="button"
              className="secondary-btn"
              onClick={handleParse}
              disabled={loadingParse || !input.trim()}
            >
              {loadingParse ? "Parsing..." : "Parse with AI"}
            </button>
            <button
              type="button"
              className="primary-btn"
              onClick={handleSave}
              disabled={loadingSave || !input.trim() || parsedItems.length === 0}
            >
              {loadingSave ? "Saving..." : "Save Log"}
            </button>
          </div>

          {parsedItems.length > 0 && (
            <div className="parsed-preview">
              <h3>Recognized items</h3>
              <ul>
                {parsedItems.map((item, idx) => (
                  <li key={idx}>
                    <span className="food-name">{item.name}</span>
                    <span className="food-meta">
                      {item.quantity} {item.unit}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {error && <div className="error-banner">{error}</div>}
        </section>

        <FoodLogList logs={logs} />

        <section className="panel">
          <div className="panel-header">
            <h2>Your profile</h2>
            <p>
              Add a few basics so we can estimate a personalized daily target.
            </p>
          </div>
          <form className="profile-grid" onSubmit={handleProfileSubmit}>
            <div className="field">
              <label htmlFor="age">Age</label>
              <input
                id="age"
                name="age"
                type="number"
                min={0}
                max={120}
                value={profileDraft.age}
                onChange={handleProfileChange}
              />
            </div>
            <div className="field">
              <label htmlFor="sex">Sex</label>
              <select
                id="sex"
                name="sex"
                value={profileDraft.sex}
                onChange={handleProfileChange}
              >
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="height_cm">Height (cm)</label>
              <input
                id="height_cm"
                name="height_cm"
                type="number"
                min={120}
                max={230}
                value={profileDraft.height_cm}
                onChange={handleProfileChange}
              />
            </div>
            <div className="field">
              <label htmlFor="weight_kg">Weight (kg)</label>
              <input
                id="weight_kg"
                name="weight_kg"
                type="number"
                min={30}
                max={250}
                value={profileDraft.weight_kg}
                onChange={handleProfileChange}
              />
            </div>
            <div className="field">
              <label htmlFor="activity_level">Activity</label>
              <select
                id="activity_level"
                name="activity_level"
                value={profileDraft.activity_level}
                onChange={handleProfileChange}
              >
                <option value="">Typical day</option>
                <option value="sedentary">Mostly sitting</option>
                <option value="light">Lightly active</option>
                <option value="moderate">On your feet often</option>
                <option value="active">Active most days</option>
                <option value="very_active">Intense training</option>
              </select>
            </div>
            <div className="profile-actions">
              <button
                type="submit"
                className="primary-btn"
                disabled={savingProfile}
              >
                {savingProfile ? "Saving..." : "Save profile"}
              </button>
              {profile?.tdee && (
                <div className="profile-tdee">
                  Estimated TDEE:&nbsp;
                  <strong>{Math.round(profile.tdee)} kcal/day</strong>
                </div>
              )}
            </div>
          </form>
          {profileError && <div className="error-banner">{profileError}</div>}
        </section>
      </main>
    </div>
  );
}


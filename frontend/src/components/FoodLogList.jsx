import { motion, AnimatePresence } from "framer-motion";
import { Utensils, Clock, Calendar } from "lucide-react";

export function FoodLogList({ logs }) {
  if (!logs?.length) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="panel"
        style={{ borderStyle: "dashed", opacity: 0.8, textAlign: "center", padding: "4rem" }}
      >
        <div style={{ fontSize: "4rem", marginBottom: "1.5rem", filter: "grayscale(0.5)" }}>🍽️</div>
        <h3 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>No memories yet...</h3>
        <p style={{ color: "var(--text-secondary)" }}>Your culinary journey begins here. Log your first meal.</p>
      </motion.div>
    );
  }

  return (
    <div className="panel" style={{ padding: "0" }}>
      <div style={{ padding: "2.5rem 2.5rem 1.5rem" }}>
        <h3 style={{ fontSize: "1.8rem", fontWeight: "800", letterSpacing: "-0.02em" }}>Activity History</h3>
        <p style={{ color: "var(--text-secondary)" }}>A look back at your nutritional choices.</p>
      </div>

      <div className="logs-list" style={{ padding: "0 1rem 1.5rem" }}>
        <AnimatePresence>
          {logs.map((log, index) => (
            <motion.article
              key={log.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="log-item"
              style={{ background: index % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent" }}
            >
              <div className="log-info-left">
                <div className="food-icon-circle">
                  <Utensils size={24} />
                </div>
                <div className="log-details">
                  <h4>{log.raw_text.charAt(0).toUpperCase() + log.raw_text.slice(1)}</h4>
                  <div className="log-meta">
                    <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                      <Clock size={14} /> {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                      <Calendar size={14} /> {new Date(log.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>
              </div>
              {typeof log.total_calories === "number" && (
                <div className="calories-pill">
                  {Math.round(log.total_calories)} <span style={{ fontSize: "0.8rem", fontWeight: "600", opacity: 0.8 }}>kcal</span>
                </div>
              )}
            </motion.article>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

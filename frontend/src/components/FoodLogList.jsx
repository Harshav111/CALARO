export function FoodLogList({ logs }) {
  if (!logs?.length) {
    return (
      <div className="panel muted">
        <p>No logs yet. Start by describing your last meal.</p>
      </div>
    );
  }

  return (
    <div className="panel">
      <div className="panel-header">
        <h3>Recent Logs</h3>
      </div>
      <div className="logs-list">
        {logs.map((log) => (
          <article key={log.id} className="log-item">
            <header className="log-header">
              <time>
                {new Date(log.created_at).toLocaleString(undefined, {
                  hour: "2-digit",
                  minute: "2-digit",
                  day: "2-digit",
                  month: "short",
                })}
              </time>
              {typeof log.total_calories === "number" && (
                <span className="calories-pill">
                  {Math.round(log.total_calories)} kcal
                </span>
              )}
            </header>
            <p className="log-raw">{log.raw_text}</p>
            {Array.isArray(log.items) && log.items.length > 0 && (
              <ul className="log-items">
                {log.items.map((item, idx) => (
                  <li key={idx}>
                    <span className="food-name">{item.name}</span>
                    <span className="food-meta">
                      {item.quantity} {item.unit}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}


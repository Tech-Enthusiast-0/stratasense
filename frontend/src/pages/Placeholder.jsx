export default function Placeholder({ title, eyebrow = 'MODULE' }) {
  return (
    <div className="page">
      <div className="page-title">
        <div>
          <span className="eyebrow">{eyebrow}</span>
          <h2>{title}</h2>
          <p>This module is reserved for extended strata telemetry and sensor expansions.</p>
        </div>
      </div>
      <div className="card placeholder-card">
        <b>Module Operational</b>
        <span>Live dashboard, GIS map, sensor telemetry and alert workflows represent the core real-time monitoring surface.</span>
      </div>
    </div>
  );
}

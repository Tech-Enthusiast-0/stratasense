import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

function MetricChart({ data, dataKey, color, title, unit }) {
  return (
    <div className="card" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
      <div className="panel-head">
        <div>
          <span className="eyebrow">{unit}</span>
          <h2>{title}</h2>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data || []}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.06)" />
          <XAxis dataKey="time" tick={{ fill: '#758397', fontSize: 10 }} tickLine={false} />
          <YAxis tick={{ fill: '#758397', fontSize: 10 }} tickLine={false} axisLine={false} />
          <Tooltip contentStyle={{ background: '#111923', border: '1px solid rgba(255,255,255,.08)', borderRadius: 8 }} />
          <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2.5} dot={false} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function Analytics({ data }) {
  const { hardwareHistory } = data;

  return (
    <div className="page" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#fff' }}>Telemetry Analytics</h1>
        <p style={{ color: '#758397', marginTop: '0.25rem' }}>Real-time historical graphing of ESP32 sensor signals.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '1.5rem' }}>
        <MetricChart data={hardwareHistory} dataKey="tilt" color="#3b82f6" title="Tilt & Inclination" unit="DEGREES (°)" />
        <MetricChart data={hardwareHistory} dataKey="vibration" color="#eab308" title="Vibration Intensity" unit="RAW SENSOR VALUE" />
        <MetricChart data={hardwareHistory} dataKey="gas_adc" color="#22c55e" title="Gas Concentration" unit="ADC" />
        <MetricChart data={hardwareHistory} dataKey="distance" color="#a855f7" title="Surface Displacement" unit="MILLIMETERS (mm)" />
      </div>
    </div>
  );
}

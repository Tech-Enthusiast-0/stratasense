import { Activity, Radio, Wifi, Database } from 'lucide-react';

export default function Diagnostics({ data }) {
  const { hardwareData, socketStatus, mode } = data;

  return (
    <div className="page" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#fff' }}>Hardware Diagnostics</h1>
        <p style={{ color: '#758397', marginTop: '0.25rem' }}>Raw payload inspection and node health metrics.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
        <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ color: '#758397', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Wifi size={16}/> CONNECTION</div>
          <strong style={{ fontSize: '1.25rem', color: socketStatus === 'connected' ? '#22c55e' : '#eab308' }}>
            {socketStatus.toUpperCase()}
          </strong>
        </div>
        <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ color: '#758397', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Radio size={16}/> DATA SOURCE</div>
          <strong style={{ fontSize: '1.25rem', color: '#fff' }}>
            {mode === 'live' ? 'WebSocket Telemetry' : 'Mock Simulator'}
          </strong>
        </div>
        <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ color: '#758397', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Database size={16}/> PAYLOAD SIZE</div>
          <strong style={{ fontSize: '1.25rem', color: '#fff' }}>
            ~140 Bytes
          </strong>
        </div>
        <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ color: '#758397', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Activity size={16}/> PING INTERVAL</div>
          <strong style={{ fontSize: '1.25rem', color: '#fff' }}>
            Real-time
          </strong>
        </div>
      </div>

      <div className="card" style={{ padding: '1.5rem' }}>
        <div className="panel-head" style={{ marginBottom: '1rem' }}>
          <div>
            <span className="eyebrow">RAW JSON</span>
            <h2>LATEST ESP32 PAYLOAD</h2>
          </div>
        </div>
        
        <pre style={{ 
          background: '#0a0f16', 
          padding: '1.5rem', 
          borderRadius: '8px', 
          border: '1px solid rgba(255,255,255,0.05)',
          color: '#3b82f6',
          fontSize: '0.9rem',
          fontFamily: 'monospace',
          overflowX: 'auto'
        }}>
          {hardwareData ? JSON.stringify(hardwareData, null, 2) : '// No data received yet...'}
        </pre>
      </div>
    </div>
  );
}

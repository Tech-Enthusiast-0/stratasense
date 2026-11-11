import StatCard from './StatCard';
import { LocateFixed, Activity, Wind, Move3d } from 'lucide-react';

export default function HardwareCards({ hardwareData }) {
  if (!hardwareData) return null;

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <div style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '0.2rem 0.5rem', background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', borderRadius: '4px', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
          <Activity size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px', marginTop: '-2px' }} />
          Edge-Computed Analysis Active
        </span>
      </div>
      <div className="stats-grid">
        <StatCard 
          label="TILT / ANGLE" 
          value={`${hardwareData.tilt ?? 0}°`} 
          icon={Move3d} 
          tone={hardwareData.tilt > 15 ? 'high' : 'safe'}
        />
        <StatCard 
          label="VIBRATION" 
          value={hardwareData.vibration ?? 0} 
          icon={Activity} 
          tone={hardwareData.vibration > 1000 ? 'high' : 'safe'}
        />
        <StatCard 
          label="GAS CONCENTRATION" 
          value={`${hardwareData.gas_adc ?? 0} ADC`} 
          icon={Wind} 
          tone={hardwareData.gas_adc > 300 ? 'high' : 'safe'}
        />
        <StatCard 
          label="DISPLACEMENT" 
          value={`${hardwareData.distance ?? 0} mm`} 
          icon={LocateFixed} 
          tone={hardwareData.distance > 50 ? 'high' : 'safe'}
        />
      </div>
    </div>
  );
}

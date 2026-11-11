import {useNavigate} from 'react-router-dom';
import {Radio,Server,ShieldCheck,TriangleAlert,Activity} from 'lucide-react';
import StatCard from '../components/StatCard';
import MineStatus from '../components/MineStatus';
import MapView from '../components/MapView';
import RiskDistribution from '../components/RiskDistribution';
import RiskTrendChart from '../components/RiskTrendChart';
import RecentSensorData from '../components/RecentSensorData';
import DeformationChart from '../components/DeformationChart';
import AlertCard from '../components/AlertCard';
import AlertBanner from '../components/AlertBanner';
import NasaWidget from '../components/NasaWidget';
import HardwareCards from '../components/HardwareCards';

export default function Dashboard({data}) {
  const nav=useNavigate();
  const {sensors,zones,alerts,liveStatus,mode,lastEvent,simulation,startSimulation,stopSimulation,resetSimulation,hardwareData,hardwareHistory}=data;
  
  const counts = {
    online: sensors.filter(s=>s.status!=='OFFLINE').length,
    safe: zones.filter(z=>z.status==='SAFE').length,
    watch: zones.filter(z=>z.status==='WATCH').length,
    high: zones.filter(z=>z.status==='HIGH'||z.status==='CRITICAL').length
  };

  const riskStatus = (hardwareData?.zone_status || 'UNKNOWN').toUpperCase();
  const riskColor = riskStatus.includes('DANGER') || riskStatus.includes('CRITICAL') ? '#ef4444' : riskStatus.includes('WARNING') || riskStatus.includes('HIGH') ? '#eab308' : '#22c55e';
  const riskScore = hardwareData?.risk_score ?? 0;

  return (
    <div className="page dashboard">
      <AlertBanner event={lastEvent}/>
      
      <HardwareCards hardwareData={hardwareData} />

      <MineStatus status={riskStatus} score={riskScore} lastUpdated={sensors[0]?.lastUpdated} mode={'live'}/>

      <div className="dashboard-grid">
        <section className="map-panel card">
          <div className="panel-head">
            <div>
              <span className="eyebrow">LIVE GIS</span>
              <h2>MINE MONITORING MAP</h2>
            </div>
            <span className="demo-label">LIVE TELEMETRY</span>
          </div>
          <MapView zones={zones} sensors={sensors} onZone={z=>nav(`/zones/${z.id}`)} onSensor={s=>nav(`/sensors/${s.id}`)}/>
        </section>

        <aside className="right-rail">
          <section className="card risk-panel">
            <div className="panel-head">
              <div>
                <span className="eyebrow">AI PREDICTIVE RISK SCORE</span>
                <h2><span className="risk-word" style={{ color: riskColor }}>{riskStatus}</span></h2>
              </div>
              <div className="risk-score" style={{ color: riskColor }}>{riskScore}<small>/100</small></div>
            </div>
            <RiskTrendChart data={hardwareHistory}/>
          </section>

          <section className="card">
            <div className="panel-head">
              <div>
                <span className="eyebrow">RISK DISTRIBUTION</span>
                <h2>Current network</h2>
              </div>
            </div>
            <RiskDistribution sensors={sensors}/>
          </section>

          {/* Mock alerts section hidden for presentation
          <section className="card">
            <div className="panel-head">
              <div>
                <span className="eyebrow">ACTIVE ALERTS</span>
                <h2>Needs attention</h2>
              </div>
              <button className="text-btn" onClick={()=>nav('/alerts')}>View all</button>
            </div>
            <div className="alert-list">
              {alerts.slice(0,3).map(a=><AlertCard key={a.id} alert={a} compact/>)}
            </div>
          </section>
          */}

          <section className="card">
            <div className="panel-head">
              <div>
                <span className="eyebrow">RECENT SENSOR DATA</span>
                <h2>Telemetry</h2>
              </div>
            </div>
            <RecentSensorData sensors={sensors}/>
          </section>

          <NasaWidget />
        </aside>
      </div>

      <div className="bottom-grid">
        <section className="card">
          <DeformationChart sensors={sensors} event={lastEvent}/>
        </section>
        
        <section className="card">
          <div className="panel-head">
            <div>
              <span className="eyebrow">ZONE-WISE RISK LEVEL</span>
              <h2>Mine zones</h2>
            </div>
            <button className="text-btn" onClick={()=>nav('/zones')}>Open zones</button>
          </div>
          <div className="zone-grid">
            {zones.slice(0,6).map(z=>
              <button key={z.id} onClick={()=>nav(`/zones/${z.id}`)} className="zone-mini">
                <b>{z.id}</b>
                <span>{z.sensorCount} nodes</span>
                <span className={`zone-state state-${z.status.toLowerCase()}`}>{z.status}</span>
              </button>
            )}
          </div>
        </section>
      </div>

      <p className="disclaimer">DEMO / SIMULATION DATA — Prototype thresholds and sensor values are illustrative and are not scientifically validated field safety criteria. The dashboard visualizes backend risk classifications; it does not certify mine safety or predict collapse.</p>
    </div>
  );
}

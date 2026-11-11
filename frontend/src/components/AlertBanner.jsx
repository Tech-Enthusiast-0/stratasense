import {TriangleAlert,X} from 'lucide-react';
import {useEffect,useState} from 'react';

export default function AlertBanner({event,onClose}) {
  const [show,setShow]=useState(!!event);
  
  useEffect(()=>{
    setShow(!!event);
    if(event){
      const t=setTimeout(()=>setShow(false),3500);
      return ()=>clearTimeout(t);
    }
  },[event]);

  if(!show||!event) return null;

  const statusStr = (event.zone_status || event.risk || '').toUpperCase();
  const elevated = statusStr.includes('DANGER') || statusStr.includes('WARNING') || statusStr.includes('CRITICAL') || statusStr.includes('HIGH') || event.type === 'ALERT';
  if (!elevated) return null;

  let color = '#eab308';
  let title = '⚠️ ALERT';

  if (statusStr.includes('WARNING')) {
    color = '#eab308';
    title = '⚠️ WARNING';
  } else if (statusStr.includes('DANGER') || statusStr.includes('CRITICAL')) {
    color = '#ef4444';
    title = '🚨 DANGER: EVACUATE';
  }

  return (
    <div style={{ 
      position: 'fixed', 
      bottom: '1.5rem', 
      right: '1.5rem', 
      zIndex: 9999, 
      width: 'auto', 
      minWidth: '250px',
      background: '#111923',
      border: `1px solid ${color}`,
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.3)',
      padding: '0.75rem 1rem', 
      display: 'flex', 
      alignItems: 'center', 
      gap: '1rem',
      borderRadius: '8px'
    }}>
      <div className="banner-icon"><TriangleAlert size={18} color={color}/></div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
        <b style={{ color: color, margin: 0 }}>{title}</b>
        <span style={{ fontSize: '0.9rem' }}>Risk Score: {event.risk_score ?? 'N/A'}</span>
      </div>
      <button onClick={()=>{setShow(false);onClose?.()}} aria-label="Dismiss alert" style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}>
        <X size={17}/>
      </button>
    </div>
  );
}

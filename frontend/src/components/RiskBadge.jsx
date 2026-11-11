const labels={SAFE:'✓ SAFE',WATCH:'⚠ WATCH',HIGH:'! HIGH',CRITICAL:'! CRITICAL',OFFLINE:'× OFFLINE',WARNING:'⚠ WARNING'};
export default function RiskBadge({risk='UNKNOWN'}){return <span className={`risk-badge risk-${String(risk).toLowerCase()}`}>{labels[risk]||risk}</span>}

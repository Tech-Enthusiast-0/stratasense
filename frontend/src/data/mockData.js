const trend = (base) => Array.from({length:18},(_,i)=>({time:`${String(10+Math.floor(i/6)).padStart(2,'0')}:${String((i*5)%60).padStart(2,'0')}`, displacement:Number((base+i*0.08+(i%4)*0.05).toFixed(2))}));

export const mockSensors = [
  ['NODE-01','A1',23.1810,79.9848,1.1,2.4,'Normal','SAFE','ONLINE'],
  ['NODE-02','A2',23.1822,79.9868,2.0,4.2,'Normal','WATCH','ONLINE'],
  ['NODE-03','B1',23.1798,79.9881,1.7,3.6,'Normal','SAFE','ONLINE'],
  ['NODE-04','B3',23.1815,79.9898,4.8,12.4,'Abnormal','HIGH','ALERT'],
  ['NODE-05','B3',23.1806,79.9908,3.9,9.1,'Elevated','HIGH','ONLINE'],
  ['NODE-06','B2',23.1830,79.9892,2.8,5.8,'Normal','WATCH','ONLINE'],
  ['NODE-07','C1',23.1785,79.9858,1.0,2.0,'Normal','SAFE','ONLINE'],
  ['NODE-08','C2',23.1777,79.9882,2.4,5.0,'Normal','WATCH','ONLINE'],
  ['NODE-09','C3',23.1769,79.9903,3.1,6.7,'Elevated','WATCH','ONLINE'],
  ['NODE-10','D1',23.1756,79.9870,5.3,14.2,'Abnormal','CRITICAL','ALERT'],
  ['NODE-11','D2',23.1748,79.9894,1.4,2.8,'Normal','SAFE','ONLINE'],
  ['NODE-12','A1',23.1828,79.9838,1.2,2.7,'Normal','SAFE','OFFLINE']
].map(([id,zone,latitude,longitude,tilt,displacement,environment,risk,status],i)=>({id,zone,latitude,longitude,tilt,displacement,environment,risk,status,lastUpdated:'10:42:31 PM',history:trend(displacement-1.3+i*.04)}));

export const mockZones = [
 ['A1','SAFE',[[23.1825,79.9828],[23.1837,79.9850],[23.1822,79.9861],[23.1808,79.9840]]],
 ['A2','WATCH',[[23.1837,79.9850],[23.1841,79.9874],[23.1825,79.9880],[23.1822,79.9861]]],
 ['B1','SAFE',[[23.1808,79.9840],[23.1822,79.9861],[23.1806,79.9881],[23.1790,79.9862]]],
 ['B2','WATCH',[[23.1822,79.9861],[23.1825,79.9880],[23.1818,79.9900],[23.1806,79.9881]]],
 ['B3','HIGH',[[23.1806,79.9881],[23.1818,79.9900],[23.1802,79.9915],[23.1788,79.9895]]],
 ['C1','SAFE',[[23.1790,79.9862],[23.1806,79.9881],[23.1788,79.9895],[23.1772,79.9870]]],
 ['C2','WATCH',[[23.1772,79.9870],[23.1788,79.9895],[23.1776,79.9912],[23.1760,79.9890]]],
 ['C3','WATCH',[[23.1760,79.9890],[23.1776,79.9912],[23.1762,79.9930],[23.1748,79.9910]]],
 ['D1','CRITICAL',[[23.1748,79.9910],[23.1762,79.9930],[23.1748,79.9941],[23.1733,79.9920]]],
 ['D2','SAFE',[[23.1733,79.9920],[23.1748,79.9941],[23.1731,79.9960],[23.1719,79.9935]]],
 ['A3','SAFE',[[23.1841,79.9874],[23.1846,79.9898],[23.1828,79.9907],[23.1818,79.9900]]],
 ['C4','SAFE',[[23.1762,79.9930],[23.1776,79.9912],[23.1784,79.9933],[23.1769,79.9950]]]
].map(([id,status,polygon])=>({id,status,polygon,sensorCount:mockSensors.filter(s=>s.zone===id).length}));

export const mockAlerts = [
 {id:'ALT-104',severity:'CRITICAL',zone:'D1',node:'NODE-10',message:'Ground movement indicator requires review',timestamp:'2m ago',status:'ACTIVE'},
 {id:'ALT-103',severity:'HIGH',zone:'B3',node:'NODE-04',message:'Rapid displacement increase detected',timestamp:'5m ago',status:'ACTIVE',previous_displacement:4.5,current_displacement:8.7},
 {id:'ALT-102',severity:'WATCH',zone:'C3',node:'NODE-09',message:'Tilt change detected',timestamp:'15m ago',status:'ACKNOWLEDGED'},
 {id:'ALT-101',severity:'WATCH',zone:'A2',node:'NODE-02',message:'Increasing deformation trend',timestamp:'22m ago',status:'RESOLVED'}
];

export const mockLiveStatus = {risk_score:72,zone_status:'WARNING'};

export const cloneMockState = () => ({sensors:structuredClone(mockSensors),zones:structuredClone(mockZones),alerts:structuredClone(mockAlerts),liveStatus:{...mockLiveStatus}});

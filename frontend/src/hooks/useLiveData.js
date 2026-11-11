import {useCallback,useEffect,useMemo,useRef,useState} from 'react';
import {getAlerts,getLiveStatus,getSensors,getZones} from '../services/api';
import {createLiveSocket} from '../services/websocket';
import {cloneMockState} from '../data/mockData';
import {shouldAnnounceLiveEvent} from '../utils/alertEvent';

export function useLiveData(){
 const initial=useMemo(cloneMockState,[]);
 const [sensors,setSensors]=useState(initial.sensors);
 const [zones,setZones]=useState(initial.zones);
 const [alerts,setAlerts]=useState(initial.alerts);
 const [liveStatus,setLiveStatus]=useState(initial.liveStatus);
 const [mode,setMode]=useState('demo');
 const [socketStatus,setSocketStatus]=useState('demo');
 const [lastEvent,setLastEvent]=useState(null);
 const [loading,setLoading]=useState(true);
 const [simulation,setSimulation]=useState(false);
 const [hardwareData,setHardwareData]=useState(null);
 const [hardwareHistory,setHardwareHistory]=useState([]);
 const timer=useRef(null);
 const step=useRef(0);
 const announcedStatus=useRef(null);

 const mergeEvent=useCallback((event)=>{
   if (shouldAnnounceLiveEvent(event, announcedStatus.current)) {
     announcedStatus.current = event.zone_status || event.type;
     setLastEvent(event);
   }
   
   if (event && event.tilt !== undefined && event.vibration !== undefined) {
     setHardwareData(event);
     setHardwareHistory(prev => {
       const next = [...prev, { 
         time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'}), 
         risk: event.risk_score ?? 0,
         tilt: event.tilt ?? 0,
         vibration: event.vibration ?? 0,
         gas_adc: event.gas_adc ?? 0,
         distance: event.distance ?? 0
       }];
       return next.slice(-20);
     });
     if (event.risk_score != null || event.zone_status) {
       setLiveStatus(ls => ({
         ...ls, 
         risk_score: event.risk_score ?? ls.risk_score, 
         zone_status: event.zone_status || ls.zone_status 
       }));
     }
     return;
   }

   if(event?.type==='ALERT'){
     const zone=event.zone?.replace('ZONE-','')||event.zone;
     const node=event.node_id||event.node;
     setAlerts(a=>[{id:`LIVE-${Date.now()}`,severity:event.risk||'HIGH',zone,node,message:event.message||'Abnormal deformation event received',timestamp:'just now',status:'ACTIVE',previous_displacement:event.previous_displacement,current_displacement:event.current_displacement},...a]);
     setSensors(ss=>ss.map(s=>s.id===node?{...s,risk:event.risk||'HIGH',status:'ALERT',displacement:event.current_displacement??s.displacement,lastUpdated:event.timestamp||s.lastUpdated,environment:'Abnormal'}:s));
     setZones(zs=>zs.map(z=>z.id===zone?{...z,status:event.risk==='CRITICAL'?'CRITICAL':'HIGH'}:z));
     setLiveStatus(ls=>({...ls,risk_score:event.risk_score??Math.max(ls.risk_score||0,85),zone_status:event.risk||'WARNING'}));
   } else if(event?.type==='SENSOR_UPDATE'||event?.type==='TELEMETRY'){
     const node=event.node_id||event.id;
     if(node) setSensors(ss=>ss.map(s=>s.id===node?{...s,...event}:s));
     if(event.risk_score!=null||event.zone_status) setLiveStatus(ls=>({...ls,...event}));
   }
 },[]);

 useEffect(()=>{
   let alive=true;
   setLoading(true);
   Promise.allSettled([getLiveStatus(),getSensors(),getZones(),getAlerts()]).then(results=>{
     if(!alive)return;
     const [live,sen,zns,als]=results;
     let liveOk=false,any=false;
     if(live.status==='fulfilled'&&live.value){setLiveStatus(v=>({...v,...live.value}));liveOk=true;any=true}
     if(sen.status==='fulfilled'&&Array.isArray(sen.value)){setSensors(sen.value);any=true}
     if(zns.status==='fulfilled'&&Array.isArray(zns.value)){setZones(zns.value);any=true}
     if(als.status==='fulfilled'&&Array.isArray(als.value)){setAlerts(als.value);any=true}
     setMode(any?'live':'demo');
     setSocketStatus(liveOk?'connecting':'demo');
     setLoading(false);
   });
   const ws=createLiveSocket({onMessage:mergeEvent,onStatus:s=>setSocketStatus(s)});
   return()=>{alive=false;ws.close()};
 },[mergeEvent]);

 const startSimulation=useCallback(()=>{
   setMode('demo');setSimulation(true);step.current=0;clearInterval(timer.current);
   timer.current=setInterval(()=>{
     step.current+=1;
     setSensors(ss=>ss.map(s=>{
       if(s.id!=='NODE-04')return s;
       const seq=[4.5,4.9,5.2,5.8,6.4,7.1,8.7,9.5];
       const d=seq[Math.min(step.current-1,seq.length-1)];
       const risk=d>=8?'HIGH':d>=5?'WATCH':'SAFE';
       return {...s,displacement:d,risk,status:risk==='HIGH'?'ALERT':'ONLINE',environment:risk==='HIGH'?'Abnormal':'Normal',lastUpdated:new Date().toLocaleTimeString()}
     }));
     if(step.current===7){
       mergeEvent({type:'ALERT',zone:'B3',node_id:'NODE-04',risk:'HIGH',message:'Sudden displacement increase detected',previous_displacement:5.8,current_displacement:8.7,timestamp:new Date().toLocaleTimeString()});
     }
     if(step.current>=8)clearInterval(timer.current)
   },1400)
 },[mergeEvent]);

 const stopSimulation=useCallback(()=>{clearInterval(timer.current);setSimulation(false)},[]);
 const resetSimulation=useCallback(()=>{
   clearInterval(timer.current);
   const s=cloneMockState();
   setSensors(s.sensors);setZones(s.zones);setAlerts(s.alerts);setLiveStatus(s.liveStatus);
   setMode('demo');setSimulation(false);setLastEvent(null);setHardwareData(null);
   announcedStatus.current=null;
 },[]);

 useEffect(()=>()=>clearInterval(timer.current),[]);
 
 return {sensors,zones,alerts,liveStatus,mode,socketStatus,lastEvent,loading,simulation,startSimulation,stopSimulation,resetSimulation,hardwareData,hardwareHistory};
}

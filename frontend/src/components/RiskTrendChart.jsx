import {ResponsiveContainer,LineChart,Line,XAxis,YAxis,Tooltip,CartesianGrid} from 'recharts';

export default function RiskTrendChart({data}) {
  return (
    <ResponsiveContainer width="100%" height={190}>
      <LineChart data={data || []}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.06)"/>
        <XAxis dataKey="time" tick={{fill:'#758397',fontSize:10}} tickLine={false}/>
        <YAxis domain={[0,100]} tick={{fill:'#758397',fontSize:10}} tickLine={false} axisLine={false}/>
        <Tooltip contentStyle={{background:'#111923',border:'1px solid rgba(255,255,255,.08)',borderRadius:8}}/>
        <Line type="monotone" dataKey="risk" stroke="#f97316" strokeWidth={2.5} dot={false} isAnimationActive={false}/>
      </LineChart>
    </ResponsiveContainer>
  );
}

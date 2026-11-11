import {ArrowUpRight} from 'lucide-react';
export default function StatCard({label,value,icon:Icon,tone='default',sub}){return <article className={`stat-card ${tone}`}><div className="stat-icon">{Icon&&<Icon size={19}/>}</div><div className="stat-copy"><span>{label}</span><strong>{value}</strong>{sub&&<small>{sub}</small>}</div><ArrowUpRight className="stat-arrow" size={16}/></article>}

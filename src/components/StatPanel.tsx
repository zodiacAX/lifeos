import { Brain, Dumbbell, HeartPulse, ScanLine, ShieldCheck } from 'lucide-react'
import type { AttributeKey, User } from '../types'

const defs: {key:AttributeKey; label:string; desc:string; Icon:any}[] = [
  {key:'intelligence', label:'INTELLIGENCE', desc:'Study / learning', Icon:Brain},
  {key:'strength', label:'STRENGTH', desc:'Exercise / movement', Icon:Dumbbell},
  {key:'discipline', label:'DISCIPLINE', desc:'Consistency / habits', Icon:ShieldCheck},
  {key:'health', label:'HEALTH', desc:'Sleep / recovery', Icon:HeartPulse},
  {key:'focus', label:'FOCUS', desc:'Deep work', Icon:ScanLine},
]

export function StatPanel({user, onAllocate}:{user:User; onAllocate:(key:AttributeKey)=>void}) {
  return <aside className="panel stat-panel">
    <div className="panel-heading"><div><span>PROFILE MATRIX</span><h2>CORE ATTRIBUTES</h2></div><em>05 SIGNALS</em></div>
    <div className="stat-list">
      {defs.map(({key,label,desc,Icon})=>{
        const val=user.attributes[key]
        return <div className="stat-row" key={key}>
          <div className="stat-icon"><Icon size={16}/></div>
          <div className="stat-copy"><div><b>{label}</b><strong>{val}</strong></div><small>{desc}</small><div className="tech-bar"><i style={{width:`${Math.min(val,100)}%`}}/></div></div>
          {user.available_points > 0 && <button className="plus-stat" onClick={()=>onAllocate(key)} aria-label={`Add point to ${label}`}>+</button>}
        </div>
      })}
    </div>
    {user.available_points > 0 && <div className="points-banner"><b>{user.available_points}</b><span>UNSPENT ATTRIBUTE POINTS</span></div>}
  </aside>
}

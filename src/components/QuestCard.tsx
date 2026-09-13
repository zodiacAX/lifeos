import { Check, Clock3, Gauge, Trash2 } from 'lucide-react'
import type { Quest } from '../types'

const short: Record<string,string> = { intelligence:'INT', strength:'STR', discipline:'DSC', health:'HLT', focus:'FOC' }

export function QuestCard({ quest, onComplete, onDelete }: { quest: Quest; onComplete: (quest: Quest, e: React.MouseEvent<HTMLButtonElement>) => void; onDelete: (id:number)=>void }) {
  const pct = Math.min(100, Math.round((quest.progress / Math.max(1, quest.target))*100))
  return <article className={`quest-card cat-${quest.category} ${quest.status === 'completed' ? 'is-complete':''}`}>
    <div className="quest-index">{String(quest.id).padStart(2,'0')}</div>
    <div className="quest-main">
      <div className="quest-meta">
        <span className="state-pill"><i/> {quest.status === 'completed' ? 'CLEARED' : 'ACTIVE'}</span>
        <span>{quest.difficulty.toUpperCase()}</span>
        <span>{short[quest.category]}</span>
        <span className="quest-repeat"><Clock3 size={12}/> {quest.repeat_rule.toUpperCase()}</span>
      </div>
      <h3>{quest.title}</h3>
      <p>{quest.description}</p>
      <div className="quest-progress-row">
        <div className="segmented-bar" aria-label={`${pct}% progress`}>
          <span style={{width:`${pct}%`}} />
        </div>
        <b>{pct}%</b>
      </div>
      <div className="quest-footer">
        <div className="rewards"><strong>+{quest.xp_reward} XP</strong><span>+{quest.credit_reward} CR</span></div>
        <div className="quest-actions">
          {quest.status !== 'completed' && <button className="complete-btn" onClick={(e)=>onComplete(quest,e)}><Check size={16}/> Complete</button>}
          <button className="icon-btn" aria-label={`Delete ${quest.title}`} onClick={()=>onDelete(quest.id)}><Trash2 size={15}/></button>
        </div>
      </div>
    </div>
  </article>
}

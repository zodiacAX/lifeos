import { CheckCircle2, LockKeyhole, ShoppingBag, Sparkles } from 'lucide-react'
import type { Reward } from '../types'

export function RewardMarket({ rewards, credits, onBuy, onEquip }: { rewards: Reward[]; credits:number; onBuy:(r:Reward)=>void; onEquip:(r:Reward)=>void }) {
  return <section className="market-shell">
    <div className="section-title-row"><div><span>SELF-DEFINED ECONOMY</span><h2>REWARD MARKET</h2></div><div className="credit-chip"><ShoppingBag size={15}/><b>{credits.toLocaleString()}</b><span>CREDITS</span></div></div>
    <div className="market-grid">
      {rewards.map(r=><article key={r.id} className={`market-card ${r.owned?'owned':''}`}>
        <div className="market-kicker"><span>{r.kind === 'cosmetic' ? 'COSMETIC' : 'REAL-LIFE'}</span>{r.slot && <em>{r.slot.toUpperCase()}</em>}</div>
        <div className="market-icon">{r.kind === 'cosmetic' ? <Sparkles/> : <CheckCircle2/>}</div>
        <h3>{r.name}</h3><p>{r.description}</p>
        <div className="market-footer">
          <strong>{r.cost} CR</strong>
          {!r.owned ? <button disabled={credits<r.cost} onClick={()=>onBuy(r)}>{credits<r.cost?<><LockKeyhole size={14}/> Locked</>:<>Unlock</>}</button> : r.kind === 'cosmetic' ? <button className={r.equipped?'equipped':''} onClick={()=>onEquip(r)}>{r.equipped?'Equipped':'Equip'}</button> : <span className="owned-label">UNLOCKED</span>}
        </div>
      </article>)}
    </div>
    <p className="market-note">No loot boxes. No real-money purchases. Credits only come from completed real-world quests.</p>
  </section>
}

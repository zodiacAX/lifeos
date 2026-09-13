import { useEffect, useMemo, useRef, useState } from 'react'
import { Activity, BookOpen, ChevronRight, CircleUserRound, Coins, Crosshair, Flame, Gauge, Gift, LogOut, Map, Menu, Plus, Target, X } from 'lucide-react'
import { api } from './api'
import type { AttributeKey, Dashboard, Quest, Reward, User } from './types'
import { CharacterStage } from './components/CharacterStage'
import { LoginGate } from './components/LoginGate'
import { QuestCard } from './components/QuestCard'
import { RewardMarket } from './components/RewardMarket'
import { StatPanel } from './components/StatPanel'

type Tab = 'map'|'quests'|'character'|'journal'|'rewards'

type Fly = {id:number; text:string; sx:number; sy:number; tx:number; ty:number}

const tabDefs:{id:Tab;label:string;Icon:any}[]=[
  {id:'map',label:'MAP',Icon:Map},
  {id:'quests',label:'QUESTS',Icon:Target},
  {id:'character',label:'CHARACTER',Icon:CircleUserRound},
  {id:'journal',label:'JOURNAL',Icon:BookOpen},
  {id:'rewards',label:'REWARDS',Icon:Gift},
]

function Header({user,tab,setTab,onLogout,xpRef}:{user:User;tab:Tab;setTab:(t:Tab)=>void;onLogout:()=>void;xpRef:React.RefObject<HTMLDivElement>}){
  const [open,setOpen]=useState(false)
  const pct=Math.round((user.xp/Math.max(1,user.xp_next))*100)
  return <header className="topbar">
    <button className="mobile-menu" onClick={()=>setOpen(!open)} aria-label="Open navigation"><Menu size={19}/></button>
    <div className="brand">LIFE<span>//</span>OS<small>PERSONAL PROGRESSION SYSTEM</small></div>
    <nav className={open?'open':''} aria-label="Primary navigation">
      {tabDefs.map(({id,label,Icon})=><button key={id} className={tab===id?'active':''} onClick={()=>{setTab(id);setOpen(false)}}><Icon size={14}/><span>{label}</span></button>)}
    </nav>
    <div className="header-stats">
      <div className="mini-stat"><span>LV</span><b>{String(user.level).padStart(2,'0')}</b></div>
      <div className="xp-mini" ref={xpRef}><div><span>XP {user.xp.toLocaleString()} / {user.xp_next.toLocaleString()}</span><b>{pct}%</b></div><i><em style={{width:`${pct}%`}}/></i></div>
      <div className="mini-credit"><Coins size={14}/><b>{user.credits.toLocaleString()}</b></div>
      <button className="logout-btn" onClick={onLogout} aria-label="Log out"><LogOut size={16}/></button>
    </div>
  </header>
}

function IdentityPanel({user}:{user:User}){
  const pct=Math.round((user.xp/Math.max(1,user.xp_next))*100)
  return <aside className="panel identity-panel">
    <div className="panel-heading"><div><span>PLAYER IDENTITY</span><h2>{user.display_name}</h2></div><em>ID // {String(user.id).padStart(4,'0')}</em></div>
    <div className="id-level"><span>LEVEL</span><strong>{user.level}</strong><small>CURRENT TIER</small></div>
    <div className="id-xp"><div><span>EXPERIENCE</span><b>{user.xp.toLocaleString()} / {user.xp_next.toLocaleString()}</b></div><div className="segmented-bar large"><span style={{width:`${pct}%`}}/></div></div>
    <div className="identity-metrics">
      <div><Flame/><span><b>{user.streak_days} DAY</b> STREAK</span></div>
      <div><Gauge/><span><b>{user.momentum}%</b> MOMENTUM</span></div>
      <div><Coins/><span><b>{user.credits.toLocaleString()}</b> CREDITS</span></div>
    </div>
    <div className="identity-note"><i/><p>Every number on this screen is created by a real action outside this screen.</p></div>
  </aside>
}

function LevelTimeline({level}:{level:number}){
  const levels=[level-3,level-2,level-1,level,level+1,level+2].filter(n=>n>0)
  return <section className="timeline panel"><div className="panel-heading"><div><span>PROGRESSION</span><h2>LEVEL TRACE</h2></div><em>LIVE</em></div><div className="level-track">{levels.map(n=><div className={n===level?'current':''} key={n}><span>LV</span><b>{n}</b><i/></div>)}</div></section>
}

function Loadout({rewards}:{rewards:Reward[]}){
  const slots=['jacket','goggles','boots','hair','cybernetic','badge']
  return <section className="panel loadout-panel"><div className="panel-heading"><div><span>PERSONALIZATION</span><h2>LOADOUT / APPEARANCE</h2></div><em>NON-COMBAT</em></div><div className="loadout-grid">{slots.map(slot=>{const equipped=rewards.find(r=>r.slot===slot&&r.equipped);return <div key={slot}><span>{slot.toUpperCase()}</span><b>{equipped?.name || 'DEFAULT'}</b></div>})}</div></section>
}

function CharacterPage({data,onAllocate}:{data:Dashboard;onAllocate:(k:AttributeKey)=>void}){
  return <main className="character-page page-shell">
    <div className="page-eyebrow">CHARACTER // DIGITAL IDENTITY // REAL-WORLD DATA</div>
    <div className="character-grid"><IdentityPanel user={data.user}/><CharacterStage user={data.user}/><StatPanel user={data.user} onAllocate={onAllocate}/></div>
    <div className="character-bottom"><LevelTimeline level={data.user.level}/><Loadout rewards={data.rewards}/></div>
  </main>
}

function QuestsPage({data,onComplete,onDelete,onCreate}:{data:Dashboard;onComplete:(q:Quest,e:React.MouseEvent<HTMLButtonElement>)=>void;onDelete:(id:number)=>void;onCreate:()=>void}){
  const active=data.quests.filter(q=>q.status==='active')
  const done=data.quests.filter(q=>q.status==='completed')
  const dailyPct=Math.min(100,Math.round((data.weekly_completed/Math.max(1,data.weekly_goal))*100))
  return <main className="page-shell quests-page">
    <section className="page-hero compact"><div><span>REAL-LIFE MISSION CONTROL</span><h1>DO THE THING.<br/><i>TAKE THE XP.</i></h1><p>Build your character by doing the work your future self actually needs.</p></div><div className="hero-protocol"><span>WEEKLY PROTOCOL</span><b>{data.weekly_completed}/{data.weekly_goal}</b><div className="segmented-bar"><span style={{width:`${dailyPct}%`}}/></div><small>{dailyPct}% CLEAR</small></div></section>
    <div className="section-title-row"><div><span>LIVE QUEUE</span><h2>ACTIVE QUESTS</h2></div><button className="new-quest" onClick={onCreate}><Plus size={16}/> New quest</button></div>
    <div className="quest-list">{active.length?active.map(q=><QuestCard key={q.id} quest={q} onComplete={onComplete} onDelete={onDelete}/>):<div className="empty-state"><Target/><h3>Queue cleared.</h3><p>Create a quest that moves your real life forward.</p></div>}</div>
    {done.length>0&&<><div className="section-title-row sub"><div><span>ARCHIVED TODAY</span><h2>RECENTLY CLEARED</h2></div><b>{done.length} QUESTS</b></div><div className="quest-list compact-list">{done.slice(0,4).map(q=><QuestCard key={q.id} quest={q} onComplete={onComplete} onDelete={onDelete}/>)}</div></>}
  </main>
}

function JournalPage({data}:{data:Dashboard}){
  const max=Math.max(1,...data.journal.map(j=>j.xp))
  return <main className="page-shell journal-page"><section className="page-hero compact"><div><span>ACTIVITY ARCHIVE</span><h1>PROOF OF<br/><i>WORK.</i></h1><p>The archive records completed actions, not good intentions.</p></div><div className="journal-big"><b>{data.journal.length}</b><span>RECORDED COMPLETIONS</span></div></section><div className="journal-layout"><section className="panel journal-chart"><div className="panel-heading"><div><span>RECENT SIGNAL</span><h2>XP OUTPUT</h2></div><em>LAST {Math.min(10,data.journal.length)}</em></div><div className="bars">{data.journal.slice(0,10).reverse().map(j=><div key={j.id}><i style={{height:`${20+(j.xp/max)*80}%`}}/><span>{j.xp}</span></div>)}</div></section><section className="journal-feed">{data.journal.length?data.journal.map(j=><article key={j.id}><div className={`journal-dot cat-${j.category}`}/><div><span>{new Date(j.completed_at).toLocaleString()}</span><h3>{j.title}</h3><p>{j.category.toUpperCase()}</p></div><strong>+{j.xp} XP</strong><em>+{j.credits} CR</em></article>):<div className="empty-state"><BookOpen/><h3>No proof yet.</h3><p>Complete your first quest.</p></div>}</section></div></main>
}

function MapPage({data,setTab}:{data:Dashboard;setTab:(t:Tab)=>void}){
  const attrs=data.user.attributes
  const nodes=[['MIND','intelligence',18,30],['BODY','strength',76,30],['DISCIPLINE','discipline',48,14],['HEALTH','health',22,72],['FOCUS','focus',72,72]] as const
  return <main className="page-shell map-page"><section className="page-hero compact"><div><span>LIFE MAP // CURRENT SEASON</span><h1>YOUR LIFE,<br/><i>AS A SYSTEM.</i></h1><p>Five real-world domains feed one character. Pick the weak signal and build it.</p></div><button className="new-quest" onClick={()=>setTab('quests')}>Open quest queue <ChevronRight size={16}/></button></section><div className="life-map panel"><div className="map-lines"/><div className="map-core"><img src="/character-portrait.png" alt="Player portrait"/><span>USER_07</span><b>LV {data.user.level}</b></div>{nodes.map(([label,key,x,y])=><button className={`map-node cat-${key}`} style={{left:`${x}%`,top:`${y}%`}} key={key} onClick={()=>setTab('quests')}><span>{label}</span><b>{attrs[key]}</b><i/></button>)}<div className="map-legend"><span><i className="cyan"/> ACTIVE GROWTH</span><span><i className="red"/> NEEDS ATTENTION</span></div></div></main>
}

function CreateQuestModal({onClose,onCreated}:{onClose:()=>void;onCreated:(q:Quest)=>void}){
  const [title,setTitle]=useState('');const [description,setDescription]=useState('');const [category,setCategory]=useState<AttributeKey>('focus');const [difficulty,setDifficulty]=useState<'easy'|'medium'|'hard'>('medium');const [repeat,setRepeat]=useState<'once'|'daily'|'weekly'>('once');const [busy,setBusy]=useState(false)
  const submit=async(e:React.FormEvent)=>{e.preventDefault();setBusy(true);try{const q=await api.createQuest({title,description,category,difficulty,repeat_rule:repeat});onCreated(q);onClose()}finally{setBusy(false)}}
  return <div className="modal-backdrop" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)onClose()}}><div className="quest-modal" role="dialog" aria-modal="true" aria-labelledby="new-quest-title"><button className="modal-x" onClick={onClose}><X/></button><span>MISSION AUTHORING</span><h2 id="new-quest-title">Create a real-world quest</h2><p>Make it specific enough that completion is obvious.</p><form onSubmit={submit}><label>QUEST NAME<input value={title} onChange={e=>setTitle(e.target.value)} required placeholder="Build personal project"/></label><label>WHY / DEFINITION<textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder="Ship the authentication flow and test it."/></label><div className="form-grid"><label>ATTRIBUTE<select value={category} onChange={e=>setCategory(e.target.value as AttributeKey)}><option value="intelligence">Intelligence</option><option value="strength">Strength</option><option value="discipline">Discipline</option><option value="health">Health</option><option value="focus">Focus</option></select></label><label>DIFFICULTY<select value={difficulty} onChange={e=>setDifficulty(e.target.value as any)}><option>easy</option><option>medium</option><option>hard</option></select></label><label>REPEAT<select value={repeat} onChange={e=>setRepeat(e.target.value as any)}><option>once</option><option>daily</option><option>weekly</option></select></label></div><button className="primary-auth" disabled={busy}>{busy?'SAVING...':'ADD TO QUEUE'}</button></form></div></div>
}

function LevelUp({oldLevel,newLevel,onClose}:{oldLevel:number;newLevel:number;onClose:()=>void}){return <div className="levelup-overlay"><div className="levelup-grid"/><div className="levelup-content"><span>PROGRESSION EVENT</span><h2>LEVEL UP</h2><div className="level-change"><b>{oldLevel}</b><i>→</i><strong>{newLevel}</strong></div><p>Your real-world actions changed your character state.</p><button onClick={onClose}>CONTINUE</button></div></div>}

export default function App(){
  const [user,setUser]=useState<User|null>(null)
  const [data,setData]=useState<Dashboard|null>(null)
  const [tab,setTab]=useState<Tab>('character')
  const [loading,setLoading]=useState(true)
  const [modal,setModal]=useState(false)
  const [levelUp,setLevelUp]=useState<{old:number;next:number}|null>(null)
  const [toast,setToast]=useState('')
  const [flies,setFlies]=useState<Fly[]>([])
  const xpRef=useRef<HTMLDivElement>(null)

  const refresh=async()=>{const d=await api.dashboard();setData(d);setUser(d.user)}
  useEffect(()=>{api.me().then(u=>{setUser(u);return api.dashboard()}).then(d=>setData(d)).catch(()=>{}).finally(()=>setLoading(false))},[])
  useEffect(()=>{const key=(e:KeyboardEvent)=>{if((e.target as HTMLElement)?.tagName==='INPUT'||(e.target as HTMLElement)?.tagName==='TEXTAREA')return;if(e.key==='1')setTab('map');if(e.key==='2')setTab('quests');if(e.key==='3')setTab('character');if(e.key==='4')setTab('journal');if(e.key==='5')setTab('rewards');if(e.key.toLowerCase()==='n'&&user)setModal(true);if(e.key==='Escape')setModal(false)};window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key)},[user])

  const auth=(u:User)=>{setUser(u);setLoading(true);api.dashboard().then(setData).finally(()=>setLoading(false))}
  const logout=async()=>{await api.logout();setUser(null);setData(null)}
  const complete=async(q:Quest,e:React.MouseEvent<HTMLButtonElement>)=>{
    if(!data)return
    const optimistic={...data,quests:data.quests.map(x=>x.id===q.id?{...x,status:'completed' as const,progress:x.target}:x)}
    setData(optimistic)
    const target=xpRef.current?.getBoundingClientRect();const fly={id:Date.now(),text:`+${q.xp_reward} XP`,sx:e.clientX,sy:e.clientY,tx:target?.left||window.innerWidth-200,ty:target?.top||24};setFlies(v=>[...v,fly]);setTimeout(()=>setFlies(v=>v.filter(x=>x.id!==fly.id)),850)
    try{const r=await api.completeQuest(q.id);setUser(r.user);setToast(`QUEST CLEARED  +${r.xp_gained} XP  +${r.credits_gained} CR`);if(r.level_up)setLevelUp({old:r.old_level,next:r.new_level});await refresh();setTimeout(()=>setToast(''),2200)}catch(err:any){setToast(err.message);await refresh()}
  }
  const deleteQuest=async(id:number)=>{await api.deleteQuest(id);await refresh()}
  const buy=async(r:Reward)=>{try{const res=await api.purchaseReward(r.id);setUser(res.user);setToast('REWARD UNLOCKED');await refresh();setTimeout(()=>setToast(''),1800)}catch(e:any){setToast(e.message)}}
  const equip=async(r:Reward)=>{await api.equipReward(r.id);setToast(`${r.name} EQUIPPED`);await refresh();setTimeout(()=>setToast(''),1500)}
  const allocate=async(k:AttributeKey)=>{const u=await api.allocateStat(k);setUser(u);await refresh()}

  if(loading)return <div className="boot-screen"><div className="boot-logo">LIFE<span>//</span>OS</div><div className="boot-line"><i/></div><p>SYNCING CHARACTER STATE</p></div>
  if(!user)return <LoginGate onAuth={auth}/>
  if(!data)return null

  return <div className="app-shell">
    <a className="skip-link" href="#main">Skip to main content</a>
    <Header user={data.user} tab={tab} setTab={setTab} onLogout={logout} xpRef={xpRef}/>
    <div id="main">
      {tab==='character'&&<CharacterPage data={data} onAllocate={allocate}/>} 
      {tab==='quests'&&<QuestsPage data={data} onComplete={complete} onDelete={deleteQuest} onCreate={()=>setModal(true)}/>} 
      {tab==='rewards'&&<main className="page-shell rewards-page"><section className="page-hero compact"><div><span>PERSONAL ECONOMY</span><h1>REWARD THE<br/><i>REAL WORK.</i></h1><p>Spend only the credits you earned by completing real-world quests.</p></div><div className="journal-big"><b>{data.user.credits.toLocaleString()}</b><span>AVAILABLE CREDITS</span></div></section><RewardMarket rewards={data.rewards} credits={data.user.credits} onBuy={buy} onEquip={equip}/></main>}
      {tab==='journal'&&<JournalPage data={data}/>} 
      {tab==='map'&&<MapPage data={data} setTab={setTab}/>} 
    </div>
    <footer><span>LIFE//OS</span><p>CYBERPUNK IS THE INTERFACE. REAL LIFE IS THE GAME.</p><b>1 MAP · 2 QUESTS · 3 CHARACTER · 4 JOURNAL · 5 REWARDS · N NEW QUEST</b></footer>
    {modal&&<CreateQuestModal onClose={()=>setModal(false)} onCreated={()=>refresh()}/>} 
    {levelUp&&<LevelUp oldLevel={levelUp.old} newLevel={levelUp.next} onClose={()=>setLevelUp(null)}/>} 
    {toast&&<div className="toast" role="status"><Activity size={15}/>{toast}</div>}
    {flies.map(f=><div className="xp-fly" key={f.id} style={{left:f.sx,top:f.sy,'--dx':`${f.tx-f.sx}px`,'--dy':`${f.ty-f.sy}px`} as React.CSSProperties}>{f.text}</div>)}
  </div>
}

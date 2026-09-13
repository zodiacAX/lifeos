import { ArrowRight, Database, Fingerprint, RefreshCw, Sparkles, UserPlus } from 'lucide-react'
import { FormEvent, useEffect, useState } from 'react'
import { api } from '../api'
import type { HealthStatus, User } from '../types'

export function LoginGate({onAuth}:{onAuth:(user:User)=>void}){
  const [mode,setMode]=useState<'login'|'register'>('login')
  const [username,setUsername]=useState('')
  const [display,setDisplay]=useState('')
  const [password,setPassword]=useState('')
  const [busy,setBusy]=useState(false)
  const [error,setError]=useState('')
  const [health,setHealth]=useState<HealthStatus|null>(null)
  const [checking,setChecking]=useState(true)

  const checkHealth=async()=>{
    setChecking(true)
    try{setHealth(await api.health())}catch{setHealth(null)}finally{setChecking(false)}
  }

  useEffect(()=>{void checkHealth()},[])

  const switchMode=(next:'login'|'register')=>{
    setMode(next);setError('');setPassword('')
  }

  const send=async(e:FormEvent)=>{
    e.preventDefault(); setBusy(true); setError('')
    try{
      const user=mode==='login'
        ? await api.login(username,password)
        : await api.register(username,display,password)
      onAuth(user)
    }catch(err:any){setError(err.message||'Could not authenticate')}finally{setBusy(false)}
  }

  const demo=async()=>{
    setBusy(true);setError('')
    try{onAuth(await api.demo())}catch(err:any){setError(err.message||'Could not load demo save')}finally{setBusy(false)}
  }

  const databaseReady=Boolean(health?.database.ready ?? true)
  const databaseTone=!health ? 'preview' : !databaseReady ? 'offline' : health.database.persistent ? 'persistent' : 'preview'
  const databaseLabel=checking ? 'CHECKING UPLINK' : !health ? 'SERVICE STATUS' : !databaseReady ? 'DATABASE UNAVAILABLE' : health.database.persistent ? 'PERSISTENT DB ONLINE' : 'PREVIEW DB / NOT PERSISTENT'
  const databaseMessage=!health
    ? 'The API connection is being checked. Login will resume automatically when the app is ready.'
    : !databaseReady
      ? 'Authentication is paused because the database is unavailable. Check the database connection, then redeploy or restart the API.'
      : health.database.persistent
        ? 'User profiles survive redeploys and cold starts.'
        : 'Preview database only. Connect Postgres before production.'

  return <main className="auth-screen">
    <div className="auth-bg-grid"/><div className="auth-glow"/>
    <section className="auth-character">
      <div className="auth-brand">LIFE<span>//</span>OS</div>
      <div className="auth-copy"><span>PERSONAL PROGRESSION SYSTEM / 07</span><h1>LEVEL UP<br/>THE LIFE<br/><i>YOU ACTUALLY LIVE.</i></h1><p>Your tasks become quests. Your consistency becomes stats. Your progress becomes a character you can see.</p></div>
      <img src="/character-full.png" alt="Cyberpunk LIFE OS character" />
      <div className="auth-signal"><i/><span>IDENTITY CORE</span><b>ONLINE</b></div>
    </section>

    <section className="auth-console">
      <div className="auth-console-head"><Fingerprint/><div><span>SECURE ENTRY</span><h2>{mode==='login'?'Resume your save':'Create your identity'}</h2></div></div>

      <div className="auth-mode-tabs" role="tablist" aria-label="Authentication mode">
        <button type="button" className={mode==='login'?'active':''} onClick={()=>switchMode('login')}><Fingerprint size={14}/> SIGN IN</button>
        <button type="button" className={mode==='register'?'active':''} onClick={()=>switchMode('register')}><UserPlus size={14}/> NEW USER</button>
      </div>

      <div className={`cloud-status ${databaseTone}`}>
        <Database size={14}/><div><b>{databaseLabel}</b><span>{databaseMessage}</span></div>
        <button type="button" onClick={checkHealth} aria-label="Retry server health check"><RefreshCw size={13}/></button>
      </div>

      <form onSubmit={send}>
        <label>HANDLE<input value={username} onChange={e=>setUsername(e.target.value)} minLength={3} maxLength={40} required placeholder={mode==='login'?'user_07':'choose_a_handle'} autoComplete="username"/></label>
        {mode==='register'&&<label>DISPLAY NAME<input value={display} onChange={e=>setDisplay(e.target.value)} maxLength={80} required placeholder="What should LIFE//OS call you?" autoComplete="name"/></label>}
        <label>ACCESS KEY<input type="password" value={password} onChange={e=>setPassword(e.target.value)} minLength={6} required placeholder="••••••••" autoComplete={mode==='login'?'current-password':'new-password'}/></label>
        {mode==='register'&&<p className="register-note">A starter quest set and character profile will be created automatically.</p>}
        {error&&<div className="auth-error" role="alert">{error}</div>}
        <button className="primary-auth" disabled={busy || !databaseReady}>{busy?'SYNCING...':mode==='login'?'ENTER LIFE//OS':'CREATE NEW IDENTITY'} <ArrowRight size={17}/></button>
      </form>

      <button type="button" className="demo-auth" onClick={demo} disabled={busy || !databaseReady}><Sparkles size={15}/> Load demo save - level 18</button>
      <button type="button" className="switch-auth" onClick={()=>switchMode(mode==='login'?'register':'login')}>{mode==='login'?'First time here? Create a new user':'Already have a save? Sign in instead'}</button>
      <div className="auth-fineprint"><span>DATABASE PERSISTENCE</span><span>SERVER-VERIFIED XP</span><span>HTTP-ONLY SESSION</span></div>
    </section>
  </main>
}

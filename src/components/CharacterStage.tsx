import type { User } from '../types'

export function CharacterStage({ user }: { user: User }) {
  return <section className="character-stage" aria-label="Character showcase">
    <div className="hud-ring ring-a"/><div className="hud-ring ring-b"/><div className="scan-column"/>
    <div className="character-floor"/>
    <img src="/character-full.png" className="character-art" alt="Cyberpunk female LIFE OS character with red utility clothing, goggles and cybernetic limbs" />
    <div className="scanline"/>
    <div className="character-tag left-tag"><span>BIOMETRIC</span><b>SYNC 98.4%</b></div>
    <div className="character-tag right-tag"><span>MODULE</span><b>CYAN//07</b></div>
    <div className="character-identity">
      <span>USER_07</span>
      <strong>LEVEL {user.level}</strong>
      <small>DIGITAL IDENTITY // REAL-WORLD PROGRESSION</small>
    </div>
  </section>
}

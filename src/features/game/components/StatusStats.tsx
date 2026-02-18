import { useSessionStore } from '../store/sessionStore'
import { StatCard } from './StatCard'

export function StatusStats() {
  const hud = useSessionStore((state) => state.hud)
  const status = hud.gameOver
    ? `Run Over on Floor ${hud.floor}`
    : `Floor ${hud.floor} · ${hud.enemiesLeft} enemies`

  return (
    <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-5">
      <StatCard label="Status" value={status} />
      <StatCard label="HP" value={`${hud.hp} / ${hud.maxHp}`} />
      <StatCard label="ATK / DEF" value={`${hud.atk} / ${hud.def}`} />
      <StatCard label="Level" value={hud.level} />
      <StatCard label="XP" value={`${hud.xp} / ${hud.nextXp}`} />
    </div>
  )
}

import { META_UPGRADES } from '../engine/meta'
import { useMetaStore } from '../store/metaStore'
import { useSessionStore } from '../store/sessionStore'
import { StatCard } from './StatCard'

export function StatusStats() {
  const hud = useSessionStore((state) => state.hud)
  const metaProgress = useMetaStore((state) => state.progress)
  const classLabel = hud.heroClass[0].toUpperCase() + hud.heroClass.slice(1)
  const status = hud.gameOver
    ? `Run Over on Floor ${hud.floor}`
    : `Floor ${hud.floor} · ${hud.enemiesLeft} enemies`
  const unlockedCount = metaProgress.unlocked.length
  const upgradesTotal = META_UPGRADES.length

  return (
    <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-8">
      <StatCard label="Class" value={classLabel} />
      <StatCard label="Status" value={status} />
      <StatCard label="HP" value={`${hud.hp} / ${hud.maxHp}`} />
      <StatCard label="ATK / DEF" value={`${hud.atk} / ${hud.def}`} />
      <StatCard label="Level" value={hud.level} />
      <StatCard label="XP" value={`${hud.xp} / ${hud.nextXp}`} />
      <StatCard label="Meta XP" value={metaProgress.metaXp} />
      <StatCard label="Unlocks" value={`${unlockedCount} / ${upgradesTotal}`} />
    </div>
  )
}

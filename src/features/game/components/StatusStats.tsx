import type { HudState } from '../engine/createRoguelikeGame'
import { StatCard } from './StatCard'

type StatusStatsProps = {
  status: string
  hud: HudState
}

export function StatusStats({ status, hud }: StatusStatsProps) {
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

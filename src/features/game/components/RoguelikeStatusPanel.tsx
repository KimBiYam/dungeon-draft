import { useMemo } from 'react'

import type { HudState } from '../engine/createRoguelikeGame'
import { useSessionStore } from '../store/sessionStore'
import { StatCard } from './StatCard'
import { StatusPanelHeader } from './StatusPanelHeader'

type StatusStatsProps = {
  status: string
  hud: HudState
}

function StatusStats({ status, hud }: StatusStatsProps) {
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

export function RoguelikeStatusPanel() {
  const hud = useSessionStore((state) => state.hud)

  const status = useMemo(() => {
    if (hud.gameOver) {
      return `Run Over on Floor ${hud.floor}`
    }
    return `Floor ${hud.floor} · ${hud.enemiesLeft} enemies`
  }, [hud.floor, hud.enemiesLeft, hud.gameOver])

  return (
    <section className="mb-5 rounded-xl border border-cyan-400/30 bg-linear-to-r from-cyan-950/70 via-zinc-900 to-emerald-950/70 p-5">
      <StatusPanelHeader />
      <StatusStats status={status} hud={hud} />
    </section>
  )
}

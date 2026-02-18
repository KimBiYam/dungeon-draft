import { useMemo } from 'react'

import { useSessionStore } from '../store/sessionStore'
import { StatusPanelHeader } from './StatusPanelHeader'
import { StatusStats } from './StatusStats'

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

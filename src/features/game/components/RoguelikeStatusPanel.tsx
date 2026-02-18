import { useSessionStore } from '../store/sessionStore'
import { StatusPanelHeader } from './StatusPanelHeader'
import { StatusStats } from './StatusStats'

export function RoguelikeStatusPanel() {
  const hud = useSessionStore((state) => state.hud)
  const status = hud.gameOver
    ? `Run Over on Floor ${hud.floor}`
    : `Floor ${hud.floor} · ${hud.enemiesLeft} enemies`

  return (
    <section className="mb-5 rounded-xl border border-cyan-400/30 bg-linear-to-r from-cyan-950/70 via-zinc-900 to-emerald-950/70 p-5">
      <StatusPanelHeader />
      <StatusStats status={status} hud={hud} />
    </section>
  )
}

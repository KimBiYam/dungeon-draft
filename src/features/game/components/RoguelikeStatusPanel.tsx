import { StatusPanelHeader } from './StatusPanelHeader'
import { StatusStats } from './StatusStats'

export function RoguelikeStatusPanel() {
  return (
    <section className="mb-5 rounded-xl border border-cyan-400/30 bg-linear-to-r from-cyan-950/70 via-zinc-900 to-emerald-950/70 p-5">
      <StatusPanelHeader />
      <StatusStats />
    </section>
  )
}

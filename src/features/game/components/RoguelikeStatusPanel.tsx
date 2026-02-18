import type { HudState } from '../engine/createRoguelikeGame'
import { AudioControls } from './AudioControls'
import { StatCard } from './StatCard'

type RoguelikeStatusPanelProps = {
  hud: HudState
  status: string
  audioMuted: boolean
  audioVolume: number
  onToggleAudioMuted: () => void
  onAudioVolumeChange: (volume: number) => void
  onOpenHelp: () => void
}

export function RoguelikeStatusPanel({
  hud,
  status,
  audioMuted,
  audioVolume,
  onToggleAudioMuted,
  onAudioVolumeChange,
  onOpenHelp,
}: RoguelikeStatusPanelProps) {
  return (
    <section className="mb-5 rounded-xl border border-cyan-400/30 bg-linear-to-r from-cyan-950/70 via-zinc-900 to-emerald-950/70 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-bold text-cyan-200">Voidcard Depths</h2>
        <div className="flex flex-wrap items-center gap-2">
          <AudioControls
            muted={audioMuted}
            volume={audioVolume}
            onToggleMuted={onToggleAudioMuted}
            onVolumeChange={onAudioVolumeChange}
          />
          <button
            type="button"
            onClick={onOpenHelp}
            className="rounded-md border border-cyan-300/40 px-3 py-1 text-xs font-semibold text-cyan-100 transition hover:bg-cyan-400/10"
          >
            Help
          </button>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-5">
        <StatCard label="Status" value={status} />
        <StatCard label="HP" value={`${hud.hp} / ${hud.maxHp}`} />
        <StatCard label="ATK / DEF" value={`${hud.atk} / ${hud.def}`} />
        <StatCard label="Level" value={hud.level} />
        <StatCard label="XP" value={`${hud.xp} / ${hud.nextXp}`} />
      </div>
    </section>
  )
}

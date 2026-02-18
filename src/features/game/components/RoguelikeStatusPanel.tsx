import { useEffect, useMemo, useState } from 'react'

import type { HudState } from '../engine/createRoguelikeGame'
import { useGameUiStore } from '../store/gameUiStore'
import { AudioControls } from './AudioControls'
import { HelpModal } from './HelpModal'
import { StatCard } from './StatCard'

type RoguelikeStatusPanelProps = {
  hud: HudState
  status: string
}

export function RoguelikeStatusPanel({ hud, status }: RoguelikeStatusPanelProps) {
  const [isHelpOpen, setIsHelpOpen] = useState(false)
  const audioMuted = useGameUiStore((state) => state.audioMuted)
  const audioVolume = useGameUiStore((state) => state.audioVolume)
  const toggleAudioMuted = useGameUiStore((state) => state.toggleAudioMuted)
  const setAudioVolumePercent = useGameUiStore((state) => state.setAudioVolumePercent)
  const setUiInputBlockedByStatusPanel = useGameUiStore(
    (state) => state.setUiInputBlockedByStatusPanel,
  )

  useEffect(() => {
    setUiInputBlockedByStatusPanel(isHelpOpen)
    return () => setUiInputBlockedByStatusPanel(false)
  }, [isHelpOpen, setUiInputBlockedByStatusPanel])

  const helpHandlers = useMemo(
    () => ({
      open: () => setIsHelpOpen(true),
      close: () => setIsHelpOpen(false),
    }),
    [],
  )

  return (
    <>
      <section className="mb-5 rounded-xl border border-cyan-400/30 bg-linear-to-r from-cyan-950/70 via-zinc-900 to-emerald-950/70 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl font-bold text-cyan-200">Dungeon Draft</h2>
          <div className="flex flex-wrap items-center gap-2">
            <AudioControls
              muted={audioMuted}
              volume={audioVolume}
              onToggleMuted={toggleAudioMuted}
              onVolumeChange={setAudioVolumePercent}
            />
            <button
              type="button"
              onClick={helpHandlers.open}
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
      <HelpModal open={isHelpOpen} onClose={helpHandlers.close} />
    </>
  )
}

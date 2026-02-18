import { useEffect, useMemo, useState } from 'react'

import { useAudioStore } from '../store/audioStore'
import { useSessionStore } from '../store/sessionStore'
import { useUiStore } from '../store/uiStore'
import { AudioControls } from './AudioControls'
import { HelpModal } from './HelpModal'
import { StatCard } from './StatCard'

export function RoguelikeStatusPanel() {
  const [isHelpOpen, setIsHelpOpen] = useState(false)
  const hud = useSessionStore((state) => state.hud)
  const audioMuted = useAudioStore((state) => state.audioMuted)
  const audioVolume = useAudioStore((state) => state.audioVolume)
  const toggleAudioMuted = useAudioStore((state) => state.toggleAudioMuted)
  const setAudioVolumePercent = useAudioStore((state) => state.setAudioVolumePercent)
  const setUiInputBlockedByStatusPanel = useUiStore(
    (state) => state.setUiInputBlockedByStatusPanel,
  )

  useEffect(() => {
    setUiInputBlockedByStatusPanel(isHelpOpen)
    return () => setUiInputBlockedByStatusPanel(false)
  }, [isHelpOpen, setUiInputBlockedByStatusPanel])

  const status = useMemo(() => {
    if (hud.gameOver) {
      return `Run Over on Floor ${hud.floor}`
    }
    return `Floor ${hud.floor} · ${hud.enemiesLeft} enemies`
  }, [hud.floor, hud.enemiesLeft, hud.gameOver])

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
              onClick={() => setIsHelpOpen(true)}
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
      <HelpModal open={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </>
  )
}

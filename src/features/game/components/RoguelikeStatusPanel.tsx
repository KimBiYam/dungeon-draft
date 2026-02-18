import { useCallback, useEffect, useMemo, useState } from 'react'

import type { HudState } from '../engine/createRoguelikeGame'
import { useSessionStore } from '../store/sessionStore'
import { useUiStore } from '../store/uiStore'
import { AudioControls } from './AudioControls'
import { HelpModal } from './HelpModal'
import { StatCard } from './StatCard'

type StatusPanelHeaderProps = {
  onOpenHelp: () => void
}

function StatusPanelHeader({ onOpenHelp }: StatusPanelHeaderProps) {
  'use memo'

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h2 className="text-2xl font-bold text-cyan-200">Dungeon Draft</h2>
      <div className="flex flex-wrap items-center gap-2">
        <AudioControls />
        <button
          type="button"
          onClick={onOpenHelp}
          className="rounded-md border border-cyan-300/40 px-3 py-1 text-xs font-semibold text-cyan-100 transition hover:bg-cyan-400/10"
        >
          Help
        </button>
      </div>
    </div>
  )
}

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
  const [isHelpOpen, setIsHelpOpen] = useState(false)
  const hud = useSessionStore((state) => state.hud)
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
  const openHelp = useCallback(() => setIsHelpOpen(true), [])
  const closeHelp = useCallback(() => setIsHelpOpen(false), [])

  return (
    <>
      <section className="mb-5 rounded-xl border border-cyan-400/30 bg-linear-to-r from-cyan-950/70 via-zinc-900 to-emerald-950/70 p-5">
        <StatusPanelHeader onOpenHelp={openHelp} />
        <StatusStats status={status} hud={hud} />
      </section>
      <HelpModal open={isHelpOpen} onClose={closeHelp} />
    </>
  )
}

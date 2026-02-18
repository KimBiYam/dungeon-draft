import { useCallback, useEffect, useState } from 'react'

import { useUiStore } from '../store/uiStore'
import { AudioControls } from './AudioControls'
import { HelpModal } from './HelpModal'

export function StatusPanelHeader() {
  'use memo'

  const [isHelpOpen, setIsHelpOpen] = useState(false)
  const setUiInputBlockedByStatusPanel = useUiStore(
    (state) => state.setUiInputBlockedByStatusPanel,
  )

  useEffect(() => {
    setUiInputBlockedByStatusPanel(isHelpOpen)
    return () => setUiInputBlockedByStatusPanel(false)
  }, [isHelpOpen, setUiInputBlockedByStatusPanel])

  const openHelp = useCallback(() => setIsHelpOpen(true), [])
  const closeHelp = useCallback(() => setIsHelpOpen(false), [])

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-bold text-cyan-200">Dungeon Draft</h2>
        <div className="flex flex-wrap items-center gap-2">
          <AudioControls />
          <button
            type="button"
            onClick={openHelp}
            className="rounded-md border border-cyan-300/40 px-3 py-1 text-xs font-semibold text-cyan-100 transition hover:bg-cyan-400/10"
          >
            Help
          </button>
        </div>
      </div>
      <HelpModal open={isHelpOpen} onClose={closeHelp} />
    </>
  )
}

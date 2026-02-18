import { useEffect, useRef } from 'react'

import { useGameUiStore } from '../store/gameUiStore'

export function DeathRestartModal() {
  const gameOver = useGameUiStore((state) => state.hud.gameOver)
  const open = useGameUiStore((state) => state.isDeathRestartOpen)
  const openDeathRestart = useGameUiStore((state) => state.openDeathRestart)
  const closeDeathRestart = useGameUiStore((state) => state.closeDeathRestart)
  const confirmNewRun = useGameUiStore((state) => state.confirmNewRun)
  const prevGameOverRef = useRef(gameOver)

  useEffect(() => {
    if (!prevGameOverRef.current && gameOver) {
      openDeathRestart()
    }
    if (!gameOver) {
      closeDeathRestart()
    }
    prevGameOverRef.current = gameOver
  }, [closeDeathRestart, gameOver, openDeathRestart])

  if (!open) {
    return null
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/75 p-4"
      onClick={closeDeathRestart}
    >
      <section
        className="w-full max-w-md rounded-xl border border-rose-500/30 bg-zinc-900 p-5"
        onClick={(event) => event.stopPropagation()}
      >
        <h3 className="text-lg font-semibold text-rose-300">You Died</h3>
        <p className="mt-3 text-sm text-zinc-200">Would you like to start a new run?</p>
        <div className="mt-4 flex gap-3">
          <button
            type="button"
            onClick={closeDeathRestart}
            className="w-full rounded-md border border-zinc-500/50 px-3 py-2 text-sm text-zinc-200 transition hover:bg-zinc-500/10"
          >
            Close
          </button>
          <button
            type="button"
            onClick={confirmNewRun}
            className="w-full rounded-md border border-rose-400/50 px-3 py-2 text-sm text-rose-200 transition hover:bg-rose-400/10"
          >
            Restart Run
          </button>
        </div>
      </section>
    </div>
  )
}

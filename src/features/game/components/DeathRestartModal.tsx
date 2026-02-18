import { useEffect, useRef } from 'react'

import { HERO_CLASSES } from '../engine/model'
import { useRuntimeStore } from '../store/runtimeStore'
import { useSessionStore } from '../store/sessionStore'
import { useUiStore } from '../store/uiStore'

export function DeathRestartModal() {
  const gameOver = useSessionStore((state) => state.hud.gameOver)
  const open = useUiStore((state) => state.isDeathRestartOpen)
  const openDeathRestart = useUiStore((state) => state.openDeathRestart)
  const closeDeathRestart = useUiStore((state) => state.closeDeathRestart)
  const heroClass = useSessionStore((state) => state.heroClass)
  const setHeroClass = useSessionStore((state) => state.setHeroClass)
  const newRun = useRuntimeStore((state) => state.newRun)
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

  const onRestart = () => {
    closeDeathRestart()
    newRun(heroClass)
  }

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
        <div className="mt-4 grid gap-2 md:grid-cols-3">
          {HERO_CLASSES.map((entry) => (
            <button
              key={entry.id}
              type="button"
              onClick={() => setHeroClass(entry.id)}
              className={`rounded-md border px-3 py-2 text-xs transition ${
                heroClass === entry.id
                  ? 'border-rose-300/70 bg-rose-500/10 text-rose-100'
                  : 'border-zinc-600/50 text-zinc-300 hover:border-rose-300/60 hover:text-rose-100'
              }`}
            >
              {entry.name}
            </button>
          ))}
        </div>
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
            onClick={onRestart}
            className="w-full rounded-md border border-rose-400/50 px-3 py-2 text-sm text-rose-200 transition hover:bg-rose-400/10"
          >
            Restart Run
          </button>
        </div>
      </section>
    </div>
  )
}

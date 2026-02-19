import { useEffect, useState } from 'react'

import { HERO_CLASSES } from '../engine/model'
import { useRuntimeStore } from '../store/runtimeStore'
import { useSessionStore } from '../store/sessionStore'
import { useUiStore } from '../store/uiStore'

export function NewRunConfirmModal() {
  const open = useUiStore((state) => state.isNewRunConfirmOpen)
  const closeNewRunConfirm = useUiStore((state) => state.closeNewRunConfirm)
  const heroClass = useSessionStore((state) => state.heroClass)
  const setHeroClass = useSessionStore((state) => state.setHeroClass)
  const newRun = useRuntimeStore((state) => state.newRun)
  const [selectedHeroClass, setSelectedHeroClass] = useState(heroClass)

  useEffect(() => {
    if (open) {
      setSelectedHeroClass(heroClass)
    }
  }, [heroClass, open])

  const onConfirm = () => {
    setHeroClass(selectedHeroClass)
    closeNewRunConfirm()
    newRun(selectedHeroClass)
  }

  if (!open) {
    return null
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4"
      onClick={closeNewRunConfirm}
    >
      <section
        className="w-full max-w-md rounded-xl border border-zinc-700 bg-zinc-900 p-5"
        onClick={(event) => event.stopPropagation()}
      >
        <h3 className="text-lg font-semibold text-cyan-200">Start New Run</h3>
        <p className="mt-3 text-sm text-zinc-200">
          Choose a class, then confirm to begin. Current progress will be replaced.
        </p>
        <div className="mt-4 grid gap-2 md:grid-cols-3">
          {HERO_CLASSES.map((entry) => (
            <button
              key={entry.id}
              type="button"
              onClick={() => setSelectedHeroClass(entry.id)}
              className={`rounded-md border px-3 py-2 text-xs transition ${
                selectedHeroClass === entry.id
                  ? 'border-cyan-300/70 bg-cyan-500/10 text-cyan-100'
                  : 'border-zinc-600/50 text-zinc-300 hover:border-cyan-300/60 hover:text-cyan-100'
              }`}
            >
              {entry.name}
            </button>
          ))}
        </div>
        <div className="mt-4 flex gap-3">
          <button
            type="button"
            onClick={closeNewRunConfirm}
            className="w-full rounded-md border border-zinc-500/50 px-3 py-2 text-sm text-zinc-200 transition hover:bg-zinc-500/10"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="w-full rounded-md border border-cyan-400/50 px-3 py-2 text-sm text-cyan-200 transition hover:bg-cyan-400/10"
          >
            Confirm
          </button>
        </div>
      </section>
    </div>
  )
}

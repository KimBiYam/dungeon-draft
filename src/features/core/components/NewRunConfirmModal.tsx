import { useState } from 'react'

import { useRuntimeStore } from '../store/runtimeStore'
import { useSessionStore } from '../store/sessionStore'
import { useUiStore } from '../store/uiStore'
import { HeroClassPicker } from './HeroClassPicker'

export function NewRunConfirmModal() {
  const open = useUiStore((state) => state.isNewRunConfirmOpen)
  const closeNewRunConfirm = useUiStore((state) => state.closeNewRunConfirm)
  const heroClass = useSessionStore((state) => state.heroClass)
  const setHeroClass = useSessionStore((state) => state.setHeroClass)
  const newRun = useRuntimeStore((state) => state.newRun)
  const [draftHeroClass, setDraftHeroClass] = useState<typeof heroClass | null>(
    null,
  )
  const selectedHeroClass = draftHeroClass ?? heroClass

  const onClose = () => {
    setDraftHeroClass(null)
    closeNewRunConfirm()
  }

  const onConfirm = () => {
    setHeroClass(selectedHeroClass)
    setDraftHeroClass(null)
    closeNewRunConfirm()
    newRun(selectedHeroClass)
  }

  if (!open) {
    return null
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4"
      onClick={onClose}
    >
      <section
        className="w-full max-w-md rounded-xl border border-zinc-700 bg-zinc-900 p-5"
        onClick={(event) => event.stopPropagation()}
      >
        <h3 className="text-lg font-semibold text-cyan-200">Start New Run</h3>
        <p className="mt-3 text-sm text-zinc-200">
          Choose a class, then confirm to begin. Current progress will be replaced.
        </p>
        <HeroClassPicker
          selected={selectedHeroClass}
          onSelect={setDraftHeroClass}
          tone="cyan"
        />
        <div className="mt-4 flex gap-3">
          <button
            type="button"
            onClick={onClose}
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

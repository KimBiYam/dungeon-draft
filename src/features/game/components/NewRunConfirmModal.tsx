import { useGameUiStore } from '../store/gameUiStore'

export function NewRunConfirmModal() {
  const open = useGameUiStore((state) => state.isNewRunConfirmOpen)
  const closeNewRunConfirm = useGameUiStore((state) => state.closeNewRunConfirm)
  const confirmNewRun = useGameUiStore((state) => state.confirmNewRun)

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
        <h3 className="text-lg font-semibold text-cyan-200">Start New Run?</h3>
        <p className="mt-3 text-sm text-zinc-200">
          Current progress will be lost. Continue?
        </p>
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
            onClick={confirmNewRun}
            className="w-full rounded-md border border-cyan-400/50 px-3 py-2 text-sm text-cyan-200 transition hover:bg-cyan-400/10"
          >
            Confirm
          </button>
        </div>
      </section>
    </div>
  )
}

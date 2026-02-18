type DeathRestartModalProps = {
  open: boolean
  onClose: () => void
  onRestart: () => void
}

export function DeathRestartModal({
  open,
  onClose,
  onRestart,
}: DeathRestartModalProps) {
  if (!open) {
    return null
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/75 p-4"
      onClick={onClose}
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
            onClick={onClose}
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

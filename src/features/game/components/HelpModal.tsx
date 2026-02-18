import { memo } from 'react'

type HelpModalProps = {
  open: boolean
  onClose: () => void
}

function HelpModalImpl({ open, onClose }: HelpModalProps) {
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
        <h3 className="text-lg font-semibold text-cyan-200">Key Bindings</h3>
        <ul className="mt-3 space-y-2 text-sm text-zinc-200">
          <li>`WASD` / Arrow Keys: Move</li>
          <li>`Space`: Wait a turn</li>
          <li>Level up: click card or press `1` / `2` / `3`</li>
        </ul>
        <button
          type="button"
          onClick={onClose}
          className="mt-4 w-full rounded-md border border-cyan-400/50 px-3 py-2 text-sm text-cyan-200 transition hover:bg-cyan-400/10"
        >
          Close
        </button>
      </section>
    </div>
  )
}

export const HelpModal = memo(HelpModalImpl)

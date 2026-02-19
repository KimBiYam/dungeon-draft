import { useRuntimeStore } from '../store/runtimeStore'
import { useSessionStore } from '../store/sessionStore'

export function FloorEventChoiceModal() {
  const choices = useSessionStore((state) => state.floorEventChoices)
  const pickFloorEventChoice = useRuntimeStore((state) => state.pickFloorEventChoice)

  if (!choices || choices.length === 0) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4">
      <section className="w-full max-w-3xl rounded-xl border border-zinc-700 bg-zinc-900 p-5">
        <h3 className="text-lg font-semibold text-cyan-200">Floor Event</h3>
        <p className="mt-2 text-sm text-zinc-300">Choose 1 option. (`1` / `2` / `3`)</p>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {choices.map((choice, index) => (
            <button
              key={choice.id}
              type="button"
              onClick={() => pickFloorEventChoice(choice.id)}
              className="rounded-lg border border-emerald-300/30 bg-zinc-950/70 p-4 text-left transition hover:border-emerald-300/70 hover:bg-emerald-500/10"
            >
              <p className="text-xs text-emerald-300">{index + 1} (NumPad {index + 1})</p>
              <p className="mt-1 text-sm font-semibold text-emerald-100">{choice.title}</p>
              <p className="mt-2 text-xs text-zinc-300">{choice.description}</p>
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}

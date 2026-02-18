import { HERO_CLASSES } from '../engine/model'
import { useRuntimeStore } from '../store/runtimeStore'
import { useSessionStore } from '../store/sessionStore'
import { useUiStore } from '../store/uiStore'

export function HeroClassSelectModal() {
  const heroClass = useSessionStore((state) => state.heroClass)
  const setHeroClass = useSessionStore((state) => state.setHeroClass)
  const isOpen = useUiStore((state) => state.isHeroClassModalOpen)
  const closeHeroClassModal = useUiStore((state) => state.closeHeroClassModal)
  const newRun = useRuntimeStore((state) => state.newRun)

  if (!isOpen) {
    return null
  }

  const pickHeroClass = (nextHeroClass: (typeof HERO_CLASSES)[number]['id']) => {
    setHeroClass(nextHeroClass)
    newRun(nextHeroClass)
    closeHeroClassModal()
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/75 p-4">
      <section className="w-full max-w-3xl rounded-xl border border-zinc-700 bg-zinc-900 p-5">
        <h3 className="text-lg font-semibold text-cyan-200">Choose Your Class</h3>
        <p className="mt-2 text-sm text-zinc-300">
          Start a run with one of three hero classes.
        </p>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {HERO_CLASSES.map((entry) => (
            <button
              key={entry.id}
              type="button"
              onClick={() => pickHeroClass(entry.id)}
              className={`rounded-lg border p-4 text-left transition ${
                heroClass === entry.id
                  ? 'border-cyan-300/70 bg-cyan-500/10'
                  : 'border-cyan-300/30 bg-zinc-950/70 hover:border-cyan-300/70 hover:bg-cyan-500/10'
              }`}
            >
              <p className="text-sm font-semibold text-cyan-100">{entry.name}</p>
              <p className="mt-1 text-xs text-zinc-300">{entry.description}</p>
              <p className="mt-3 text-xs text-zinc-300">
                HP {entry.baseHp} · ATK {entry.baseAtk} · DEF {entry.baseDef}
              </p>
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}

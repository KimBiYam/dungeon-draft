import { useRuntimeStore } from '../store/runtimeStore'
import { useSessionStore } from '../store/sessionStore'

function getTagLabel(tag: string) {
  if (tag === 'offense') return { label: 'OFFENSE', tone: 'text-rose-200 border-rose-300/50 bg-rose-500/10' }
  if (tag === 'defense') return { label: 'DEFENSE', tone: 'text-sky-200 border-sky-300/50 bg-sky-500/10' }
  if (tag === 'sustain') return { label: 'SUSTAIN', tone: 'text-emerald-200 border-emerald-300/50 bg-emerald-500/10' }
  if (tag === 'xp') return { label: 'XP', tone: 'text-violet-200 border-violet-300/50 bg-violet-500/10' }
  return { label: 'RISK', tone: 'text-amber-200 border-amber-300/50 bg-amber-500/10' }
}

export function LevelUpChoiceModal() {
  const choices = useSessionStore((state) => state.levelUpChoices)
  const pickLevelUpChoice = useRuntimeStore((state) => state.pickLevelUpChoice)

  if (!choices || choices.length === 0) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4">
      <section className="w-full max-w-3xl rounded-xl border border-zinc-700 bg-zinc-900 p-5">
        <h3 className="text-lg font-semibold text-cyan-200">Level Up Reward</h3>
        <p className="mt-2 text-sm text-zinc-300">Choose 1 card. (`1` / `2` / `3`)</p>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {choices.map((choice, index) => (
            <button
              key={choice.id}
              type="button"
              onClick={() => pickLevelUpChoice(choice.id)}
              className="rounded-lg border border-cyan-300/30 bg-zinc-950/70 p-4 text-left transition hover:border-cyan-300/70 hover:bg-cyan-500/10"
            >
              <p className="text-xs text-cyan-300">{index + 1} (NumPad {index + 1})</p>
              <p className="mt-1 text-sm font-semibold text-cyan-100">{choice.title}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {choice.tags.map((tag) => {
                  const style = getTagLabel(tag)
                  return (
                    <span
                      key={`${choice.id}-${tag}`}
                      className={`rounded border px-1.5 py-0.5 text-[10px] font-semibold tracking-wide ${style.tone}`}
                    >
                      {style.label}
                    </span>
                  )
                })}
              </div>
              <p className="mt-2 text-xs text-zinc-300">{choice.description}</p>
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}

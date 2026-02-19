import { HERO_CLASSES, type HeroClassId } from '../engine/model'

type HeroClassPickerProps = {
  selected: HeroClassId
  onSelect: (heroClass: HeroClassId) => void
  tone: 'cyan' | 'rose'
}

const toneStyles = {
  cyan: {
    active: 'border-cyan-300/70 bg-cyan-500/10 text-cyan-100',
    idle: 'border-zinc-600/50 text-zinc-300 hover:border-cyan-300/60 hover:text-cyan-100',
  },
  rose: {
    active: 'border-rose-300/70 bg-rose-500/10 text-rose-100',
    idle: 'border-zinc-600/50 text-zinc-300 hover:border-rose-300/60 hover:text-rose-100',
  },
} as const

export function HeroClassPicker({ selected, onSelect, tone }: HeroClassPickerProps) {
  const styles = toneStyles[tone]

  return (
    <div className="mt-4 grid gap-2 md:grid-cols-3">
      {HERO_CLASSES.map((entry) => (
        <button
          key={entry.id}
          type="button"
          onClick={() => onSelect(entry.id)}
          className={`rounded-md border px-3 py-2 text-xs transition ${
            selected === entry.id ? styles.active : styles.idle
          }`}
        >
          {entry.name}
        </button>
      ))}
    </div>
  )
}

import { useSessionStore } from '../store/sessionStore'
import { useUiStore } from '../store/uiStore'

function getLogTone(line: string) {
  if (line.includes('Meta unlock')) {
    return 'text-amber-300'
  }
  if (line.includes('Portal resonance') || line.includes('Potion!')) {
    return 'text-emerald-300'
  }
  if (line.includes('Level up!') || line.includes('Card picked')) {
    return 'text-cyan-300'
  }
  if (
    line.includes('trap') ||
    line.includes('take') ||
    line.includes('died') ||
    line.includes('slain')
  ) {
    return 'text-rose-300'
  }
  if (line.includes('down') || line.includes('XP +')) {
    return 'text-violet-300'
  }
  return 'text-zinc-300'
}

export function CombatLogPanel() {
  const logs = useSessionStore((state) => state.logs)
  const openNewRunConfirm = useUiStore((state) => state.openNewRunConfirm)

  return (
    <aside className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
      <h3 className="mb-3 text-lg font-semibold">Combat Log</h3>
      <ul className="h-120 space-y-2 overflow-y-auto rounded-md border border-zinc-800 bg-zinc-950/70 p-3 text-sm text-zinc-300">
        {logs.map((line, idx) => (
          <li key={`${line}-${idx}`} className={getLogTone(line)}>
            {line}
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={openNewRunConfirm}
        className="mt-4 w-full rounded-md border border-cyan-400/50 px-3 py-2 text-sm text-cyan-200 transition hover:bg-cyan-400/10"
      >
        New Run
      </button>
    </aside>
  )
}

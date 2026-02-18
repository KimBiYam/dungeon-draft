type CombatLogPanelProps = {
  logs: string[]
  onRequestNewRun: () => void
}

export function CombatLogPanel({ logs, onRequestNewRun }: CombatLogPanelProps) {
  return (
    <aside className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
      <h3 className="mb-3 text-lg font-semibold">Combat Log</h3>
      <ul className="h-120 space-y-2 overflow-y-auto rounded-md border border-zinc-800 bg-zinc-950/70 p-3 text-sm text-zinc-300">
        {logs.map((line, idx) => (
          <li key={`${line}-${idx}`}>{line}</li>
        ))}
      </ul>
      <button
        type="button"
        onClick={onRequestNewRun}
        className="mt-4 w-full rounded-md border border-cyan-400/50 px-3 py-2 text-sm text-cyan-200 transition hover:bg-cyan-400/10"
      >
        New Run
      </button>
    </aside>
  )
}

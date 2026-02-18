import { memo } from 'react'

type StatCardProps = {
  label: string
  value: string | number
}

function StatCardImpl({ label, value }: StatCardProps) {
  return (
    <div className="rounded-md border border-zinc-800 bg-zinc-950/70 p-3">
      <p className="text-xs uppercase tracking-wide text-zinc-500">{label}</p>
      <p className="mt-1 text-base font-semibold">{value}</p>
    </div>
  )
}

export const StatCard = memo(StatCardImpl)

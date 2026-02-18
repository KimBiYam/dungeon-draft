import { Link } from '@tanstack/react-router'

export default function Header() {
  return (
    <header className="border-b border-zinc-800 bg-zinc-950/95 p-4 text-zinc-100 shadow-lg">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <Link to="/" className="text-lg font-bold tracking-wide text-emerald-200">
          Ashen Depths
        </Link>
        <p className="text-xs text-zinc-400">Roguelike Prototype</p>
      </div>
    </header>
  )
}

import { RoguelikeGameWidget } from '../../widgets/game/RoguelikeGameWidget'

export function HomePage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <RoguelikeGameWidget />
      </div>
    </main>
  )
}

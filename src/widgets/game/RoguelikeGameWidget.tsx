import { CombatLogPanel } from '../../features/game/components/CombatLogPanel'
import { GameApiSettingsSync } from '../../features/game/components/GameApiSettingsSync'
import { DeathRestartModal } from '../../features/game/components/DeathRestartModal'
import { GameInputBlockSync } from '../../features/game/components/GameInputBlockSync'
import { InitialClassSelectModal } from '../../features/game/components/InitialClassSelectModal'
import { LevelUpChoiceModal } from '../../features/game/components/LevelUpChoiceModal'
import { NewRunConfirmModal } from '../../features/game/components/NewRunConfirmModal'
import RoguelikeCanvas from '../../features/game/components/RoguelikeCanvas'
import { RoguelikeStatusPanel } from '../../features/game/components/RoguelikeStatusPanel'
import { useUiStore } from '../../features/game/store/uiStore'

export function RoguelikeGameWidget() {
  const isInitialClassSelectOpen = useUiStore(
    (state) => state.isInitialClassSelectOpen,
  )
  const showGame = !isInitialClassSelectOpen

  return (
    <div className="min-h-[780px]">
      <GameApiSettingsSync />
      <GameInputBlockSync />
      <InitialClassSelectModal />
      {showGame ? (
        <>
          <RoguelikeStatusPanel />

          <section className="grid gap-5 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <RoguelikeCanvas />
            </div>

            <CombatLogPanel />
          </section>

          <LevelUpChoiceModal />
          <DeathRestartModal />
          <NewRunConfirmModal />
        </>
      ) : (
        <>
          <section className="mb-5 rounded-xl border border-cyan-400/30 bg-linear-to-r from-cyan-950/70 via-zinc-900 to-emerald-950/70 p-5">
            <div className="h-[104px]" />
          </section>
          <section className="grid gap-5 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="relative overflow-hidden rounded-xl border border-zinc-700 bg-black">
                <div className="aspect-16/10 w-full" />
              </div>
            </div>
            <aside className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
              <div className="h-120 rounded-md border border-zinc-800 bg-zinc-950/70" />
              <div className="mt-4 h-10 rounded-md border border-cyan-400/40" />
            </aside>
          </section>
        </>
      )}
    </div>
  )
}

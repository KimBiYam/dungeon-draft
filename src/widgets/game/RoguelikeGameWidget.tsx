import { CombatLogPanel } from '../../features/game/components/CombatLogPanel'
import { DeathRestartModal } from '../../features/game/components/DeathRestartModal'
import { GameInputBlockSync } from '../../features/game/components/GameInputBlockSync'
import { LevelUpChoiceModal } from '../../features/game/components/LevelUpChoiceModal'
import { NewRunConfirmModal } from '../../features/game/components/NewRunConfirmModal'
import RoguelikeCanvas from '../../features/game/components/RoguelikeCanvas'
import { RoguelikeStatusPanel } from '../../features/game/components/RoguelikeStatusPanel'

export function RoguelikeGameWidget() {
  return (
    <>
      <GameInputBlockSync />
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
  )
}

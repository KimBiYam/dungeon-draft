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

  return (
    <div className="min-h-[780px]">
      <GameApiSettingsSync />
      <GameInputBlockSync />
      <InitialClassSelectModal />
      {isInitialClassSelectOpen ? null : (
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
      )}
    </div>
  )
}

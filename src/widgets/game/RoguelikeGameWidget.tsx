import { CombatLogPanel } from '../../features/core/components/CombatLogPanel'
import { GameApiSettingsSync } from '../../features/core/components/GameApiSettingsSync'
import { DeathRestartModal } from '../../features/core/components/DeathRestartModal'
import { FloorEventChoiceModal } from '../../features/level/components/FloorEventChoiceModal'
import { GameInputBlockSync } from '../../features/core/components/GameInputBlockSync'
import { InitialClassSelectModal } from '../../features/core/components/InitialClassSelectModal'
import { LevelUpChoiceModal } from '../../features/level/components/LevelUpChoiceModal'
import { NewRunConfirmModal } from '../../features/core/components/NewRunConfirmModal'
import RoguelikeCanvas from '../../features/core/components/RoguelikeCanvas'
import { RoguelikeStatusPanel } from '../../features/core/components/RoguelikeStatusPanel'
import { useUiStore } from '../../features/core/store/uiStore'

export function RoguelikeGameWidget() {
  const isInitialClassSelectOpen = useUiStore(
    (state) => state.isInitialClassSelectOpen,
  )

  return (
    <div className="min-h-[780px]">
      <GameApiSettingsSync />
      <GameInputBlockSync />
      <InitialClassSelectModal />
      <RoguelikeStatusPanel />

      <section className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RoguelikeCanvas enabled={!isInitialClassSelectOpen} />
        </div>

        <CombatLogPanel />
      </section>

      <LevelUpChoiceModal />
      <FloorEventChoiceModal />
      <DeathRestartModal />
      <NewRunConfirmModal />
    </div>
  )
}

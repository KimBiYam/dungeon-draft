import { useCallback, useEffect, useMemo, useState } from 'react'

import { CombatLogPanel } from '../../features/game/components/CombatLogPanel'
import { HelpModal } from '../../features/game/components/HelpModal'
import { NewRunConfirmModal } from '../../features/game/components/NewRunConfirmModal'
import RoguelikeCanvas from '../../features/game/components/RoguelikeCanvas'
import { RoguelikeStatusPanel } from '../../features/game/components/RoguelikeStatusPanel'
import { useRoguelikeUi } from '../../features/game/hooks/useRoguelikeUi'

export function RoguelikeGameWidget() {
  const [isHelpOpen, setIsHelpOpen] = useState(false)
  const [isNewRunConfirmOpen, setIsNewRunConfirmOpen] = useState(false)
  const {
    hud,
    logs,
    status,
    setHud,
    pushLog,
    newRun,
    setUiInputBlocked,
    audioMuted,
    audioVolume,
    toggleAudioMuted,
    setAudioVolumePercent,
    spendGoldForHeal,
    spendGoldForWeaponUpgrade,
    spendGoldForArmorUpgrade,
    canSpendGoldForHeal,
    canUpgradeWeapon,
    canUpgradeArmor,
    goldHealCost,
    weaponUpgradeCost,
    armorUpgradeCost,
    setApi,
  } = useRoguelikeUi()

  const isAnyModalOpen = useMemo(
    () => isHelpOpen || isNewRunConfirmOpen,
    [isHelpOpen, isNewRunConfirmOpen],
  )

  useEffect(() => {
    setUiInputBlocked(isAnyModalOpen)
  }, [isAnyModalOpen, setUiInputBlocked])

  const openHelp = useCallback(() => setIsHelpOpen(true), [])
  const closeHelp = useCallback(() => setIsHelpOpen(false), [])
  const requestNewRun = useCallback(() => setIsNewRunConfirmOpen(true), [])
  const cancelNewRun = useCallback(() => setIsNewRunConfirmOpen(false), [])
  const confirmNewRun = useCallback(() => {
    setIsNewRunConfirmOpen(false)
    newRun()
  }, [newRun])

  return (
    <>
      <RoguelikeStatusPanel
        hud={hud}
        status={status}
        audioMuted={audioMuted}
        audioVolume={audioVolume}
        onToggleAudioMuted={toggleAudioMuted}
        onAudioVolumeChange={setAudioVolumePercent}
        onOpenHelp={openHelp}
      />

      <section className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RoguelikeCanvas onState={setHud} onLog={pushLog} onReady={setApi} />
        </div>

        <CombatLogPanel
          logs={logs}
          canSpendGoldForHeal={canSpendGoldForHeal}
          goldHealCost={goldHealCost}
          onSpendGoldForHeal={spendGoldForHeal}
          canUpgradeWeapon={canUpgradeWeapon}
          canUpgradeArmor={canUpgradeArmor}
          weaponUpgradeCost={weaponUpgradeCost}
          armorUpgradeCost={armorUpgradeCost}
          onUpgradeWeapon={spendGoldForWeaponUpgrade}
          onUpgradeArmor={spendGoldForArmorUpgrade}
          onRequestNewRun={requestNewRun}
        />
      </section>

      <HelpModal open={isHelpOpen} onClose={closeHelp} />
      <NewRunConfirmModal
        open={isNewRunConfirmOpen}
        onCancel={cancelNewRun}
        onConfirm={confirmNewRun}
      />
    </>
  )
}

import RoguelikeCanvas from '../../features/game/components/RoguelikeCanvas'
import { CombatLogPanel } from '../../features/game/components/CombatLogPanel'
import { RoguelikeStatusPanel } from '../../features/game/components/RoguelikeStatusPanel'
import { useRoguelikeUi } from '../../features/game/hooks/useRoguelikeUi'

export function RoguelikeGameWidget() {
  const {
    hud,
    logs,
    status,
    setHud,
    pushLog,
    newRun,
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

  return (
    <>
      <RoguelikeStatusPanel hud={hud} status={status} />

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
          onNewRun={newRun}
        />
      </section>
    </>
  )
}

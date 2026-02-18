type CombatLogPanelProps = {
  logs: string[];
  canSpendGoldForHeal: boolean;
  goldHealCost: number;
  onSpendGoldForHeal: () => void;
  canUpgradeWeapon: boolean;
  canUpgradeArmor: boolean;
  weaponUpgradeCost: number;
  armorUpgradeCost: number;
  onUpgradeWeapon: () => void;
  onUpgradeArmor: () => void;
  onNewRun: () => void;
};

export function CombatLogPanel({
  logs,
  canSpendGoldForHeal,
  goldHealCost,
  onSpendGoldForHeal,
  canUpgradeWeapon,
  canUpgradeArmor,
  weaponUpgradeCost,
  armorUpgradeCost,
  onUpgradeWeapon,
  onUpgradeArmor,
  onNewRun,
}: CombatLogPanelProps) {
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
        onClick={onSpendGoldForHeal}
        disabled={!canSpendGoldForHeal}
        className="mt-4 w-full rounded-md border border-emerald-400/50 px-3 py-2 text-sm text-emerald-200 transition hover:bg-emerald-400/10 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Mend HP (-{goldHealCost} Gold)
      </button>
      <button
        type="button"
        onClick={onUpgradeWeapon}
        disabled={!canUpgradeWeapon}
        className="mt-3 w-full rounded-md border border-amber-400/50 px-3 py-2 text-sm text-amber-200 transition hover:bg-amber-400/10 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Upgrade Weapon (-{weaponUpgradeCost} Gold)
      </button>
      <button
        type="button"
        onClick={onUpgradeArmor}
        disabled={!canUpgradeArmor}
        className="mt-3 w-full rounded-md border border-sky-400/50 px-3 py-2 text-sm text-sky-200 transition hover:bg-sky-400/10 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Upgrade Armor (-{armorUpgradeCost} Gold)
      </button>
      <button
        type="button"
        onClick={onNewRun}
        className="mt-3 w-full rounded-md border border-cyan-400/50 px-3 py-2 text-sm text-cyan-200 transition hover:bg-cyan-400/10"
      >
        New Run
      </button>
    </aside>
  );
}

import type { HudState } from "../engine/createRoguelikeGame";

type RoguelikeStatusPanelProps = {
  hud: HudState;
  status: string;
};

export function RoguelikeStatusPanel({
  hud,
  status,
}: RoguelikeStatusPanelProps) {
  return (
    <section className="mb-5 rounded-xl border border-cyan-400/30 bg-linear-to-r from-cyan-950/70 via-zinc-900 to-emerald-950/70 p-5">
      <h2 className="text-2xl font-bold text-cyan-200">Ashen Depths</h2>
      <p className="mt-2 text-sm text-zinc-300">
        Phaser-powered roguelike combat. Controls: `WASD` / Arrow Keys /
        Space(wait) / Q(weapon) / E(armor)
      </p>
      <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-6">
        <Stat label="Status" value={status} />
        <Stat label="HP" value={`${hud.hp} / ${hud.maxHp}`} />
        <Stat
          label="ATK / DEF"
          value={`${hud.atk} / ${hud.def} (+${hud.weaponLevel - 1} / +${hud.armorLevel - 1})`}
        />
        <Stat label="Level" value={hud.level} />
        <Stat label="XP" value={`${hud.xp} / ${hud.nextXp}`} />
        <Stat label="Gold" value={hud.gold} />
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-md border border-zinc-800 bg-zinc-950/70 p-3">
      <p className="text-xs uppercase tracking-wide text-zinc-500">{label}</p>
      <p className="mt-1 text-base font-semibold">{value}</p>
    </div>
  );
}

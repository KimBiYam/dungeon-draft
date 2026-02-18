import { useState } from "react";

import type { HudState } from "../engine/createRoguelikeGame";

type RoguelikeStatusPanelProps = {
  hud: HudState;
  status: string;
};

export function RoguelikeStatusPanel({
  hud,
  status,
}: RoguelikeStatusPanelProps) {
  const [showHelp, setShowHelp] = useState(false);

  return (
    <section className="mb-5 rounded-xl border border-cyan-400/30 bg-linear-to-r from-cyan-950/70 via-zinc-900 to-emerald-950/70 p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-2xl font-bold text-cyan-200">Ashen Depths</h2>
        <button
          type="button"
          onClick={() => setShowHelp(true)}
          className="rounded-md border border-cyan-300/40 px-3 py-1 text-xs font-semibold text-cyan-100 transition hover:bg-cyan-400/10"
        >
          Help
        </button>
      </div>
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
      {showHelp ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4"
          onClick={() => setShowHelp(false)}
        >
          <section
            className="w-full max-w-md rounded-xl border border-zinc-700 bg-zinc-900 p-5"
            onClick={(event) => event.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-cyan-200">Key Bindings</h3>
            <ul className="mt-3 space-y-2 text-sm text-zinc-200">
              <li>`WASD` / Arrow Keys: Move</li>
              <li>`Space`: Wait a turn</li>
              <li>`Q`: Upgrade Weapon</li>
              <li>`E`: Upgrade Armor</li>
            </ul>
            <button
              type="button"
              onClick={() => setShowHelp(false)}
              className="mt-4 w-full rounded-md border border-cyan-400/50 px-3 py-2 text-sm text-cyan-200 transition hover:bg-cyan-400/10"
            >
              Close
            </button>
          </section>
        </div>
      ) : null}
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

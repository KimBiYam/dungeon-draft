import { clamp, type TrapKind, type RunState } from './model'

type Roll = (min: number, max: number) => number

export class LootService {
  constructor(private readonly roll: Roll) {}

  applyTrapEffect(kind: TrapKind) {
    if (kind === 'spike') return this.roll(4, 8)
    if (kind === 'flame') return this.roll(6, 10)
    return this.roll(3, 7)
  }

  applyChestReward(run: RunState, rarity: 'common' | 'rare') {
    if (rarity === 'rare') {
      if (this.roll(0, 1) === 0) {
        run.atk += 2
        return 'Rare chest! ATK +2.'
      }
      run.def += 2
      return 'Rare chest! DEF +2.'
    }

    if (run.hp < run.maxHp && this.roll(0, 1) === 0) {
      const heal = this.roll(5, 10)
      run.hp = clamp(run.hp + heal, 0, run.maxHp)
      return `Chest loot! +${heal} HP.`
    }

    const xp = this.roll(6, 12)
    run.xp += xp
    return `Chest loot! +${xp} XP.`
  }
}

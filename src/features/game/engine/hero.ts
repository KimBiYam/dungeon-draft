import { clamp, type RunState } from './model'

type Roll = (min: number, max: number) => number

export class HeroRoleService {
  constructor(private readonly roll: Roll) {}

  calculateAttackDamage(heroAtk: number) {
    return this.roll(Math.max(1, heroAtk - 2), heroAtk + 3)
  }

  applyLevelUps(run: RunState) {
    const logs: string[] = []

    while (run.xp >= run.nextXp) {
      run.xp -= run.nextXp
      run.level += 1
      run.nextXp = Math.floor(run.nextXp * 1.32)
      run.maxHp += 4
      run.hp = clamp(run.hp + 4, 0, run.maxHp)
      run.atk += 1
      if (run.level % 3 === 0) run.def += 1
      logs.push(`Level up! Lv.${run.level}`)
    }

    return logs
  }
}

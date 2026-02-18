import type { Pos } from './model'

type Roll = (min: number, max: number) => number

export class MonsterRoleService {
  constructor(private readonly roll: Roll) {}

  calculateAttackDamage(enemyAtk: number, playerDef: number) {
    return Math.max(1, this.roll(enemyAtk - 1, enemyAtk + 1) - playerDef)
  }

  getChaseStep(enemyPos: Pos, playerPos: Pos): Pos {
    if (Math.abs(playerPos.x - enemyPos.x) > Math.abs(playerPos.y - enemyPos.y)) {
      return { x: playerPos.x > enemyPos.x ? 1 : -1, y: 0 }
    }

    return { x: 0, y: playerPos.y > enemyPos.y ? 1 : -1 }
  }
}

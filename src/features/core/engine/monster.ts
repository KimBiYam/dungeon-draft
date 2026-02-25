import type { MonsterBehavior } from './monsterTypes'
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

  getChargerStep(enemyPos: Pos, playerPos: Pos): Pos {
    const dx = playerPos.x - enemyPos.x
    const dy = playerPos.y - enemyPos.y

    if (dy === 0 && Math.abs(dx) >= 2 && Math.abs(dx) <= 4) {
      return { x: dx > 0 ? 2 : -2, y: 0 }
    }
    if (dx === 0 && Math.abs(dy) >= 2 && Math.abs(dy) <= 4) {
      return { x: 0, y: dy > 0 ? 2 : -2 }
    }
    return this.getChaseStep(enemyPos, playerPos)
  }

  canUseRangedAttack(
    enemyPos: Pos,
    playerPos: Pos,
    wallAt: (pos: Pos) => boolean,
    range = 3,
  ) {
    const dx = playerPos.x - enemyPos.x
    const dy = playerPos.y - enemyPos.y
    const sameCol = dx === 0
    const sameRow = dy === 0
    if (!sameCol && !sameRow) return false

    const distance = Math.abs(dx) + Math.abs(dy)
    if (distance < 2 || distance > range) return false

    const step = {
      x: dx === 0 ? 0 : dx > 0 ? 1 : -1,
      y: dy === 0 ? 0 : dy > 0 ? 1 : -1,
    }
    let cursor = { ...enemyPos }
    for (let i = 1; i < distance; i++) {
      cursor = { x: cursor.x + step.x, y: cursor.y + step.y }
      if (wallAt(cursor)) return false
    }
    return true
  }

  shouldSummon(floor: number) {
    const chance = Math.min(55, 20 + floor * 3)
    return this.roll(1, 100) <= chance
  }

  getSummonSpawnPos(
    summonerPos: Pos,
    canOccupy: (pos: Pos) => boolean,
  ): Pos | null {
    const candidates = [
      { x: summonerPos.x + 1, y: summonerPos.y },
      { x: summonerPos.x - 1, y: summonerPos.y },
      { x: summonerPos.x, y: summonerPos.y + 1 },
      { x: summonerPos.x, y: summonerPos.y - 1 },
    ]
    const free = candidates.filter((pos) => canOccupy(pos))
    if (free.length === 0) return null
    return free[this.roll(0, free.length - 1)]
  }

  createSummonedEnemyId(floor: number, turn: number, index: number) {
    return `f${floor}-summon-${turn}-${index}`
  }

  getBehaviorLabel(behavior: MonsterBehavior) {
    if (behavior === 'charger') return 'charger'
    if (behavior === 'ranged') return 'marksman'
    if (behavior === 'summoner') return 'summoner'
    return 'stalker'
  }
}

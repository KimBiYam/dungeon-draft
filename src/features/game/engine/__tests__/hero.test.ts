import { describe, expect, it } from 'vitest'

import type { RunState } from '../model'
import { HeroRoleService } from '../hero'

describe('hero role logic', () => {
  it('calculates hero attack damage with expected range', () => {
    let called: [number, number] | null = null
    const heroRole = new HeroRoleService((min, max) => {
      called = [min, max]
      return min
    })
    const damage = heroRole.calculateAttackDamage(1)

    expect(called).toEqual([1, 4])
    expect(damage).toBe(1)
  })

  it('applies multiple level-ups while xp is enough', () => {
    const run: RunState = {
      floor: 1,
      turn: 0,
      hp: 20,
      maxHp: 32,
      atk: 7,
      def: 1,
      level: 1,
      xp: 40,
      nextXp: 16,
      gold: 0,
      player: { x: 1, y: 1 },
      floorData: { walls: new Set(), enemies: [], potions: [], goldPiles: [], exit: { x: 2, y: 2 } },
      gameOver: false,
    }

    const heroRole = new HeroRoleService(() => 0)
    const logs = heroRole.applyLevelUps(run)

    expect(logs).toEqual(['Level up! Lv.2', 'Level up! Lv.3'])
    expect(run.level).toBe(3)
    expect(run.xp).toBe(3)
    expect(run.nextXp).toBe(27)
    expect(run.maxHp).toBe(40)
    expect(run.hp).toBe(28)
    expect(run.atk).toBe(9)
    expect(run.def).toBe(2)
  })
})

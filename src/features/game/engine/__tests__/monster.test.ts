import { describe, expect, it } from 'vitest'

import { MonsterRoleService } from '../monster'

describe('monster role logic', () => {
  it('calculates monster attack damage with player defense and minimum 1', () => {
    const monsterRole = new MonsterRoleService(() => 5)
    const reduced = monsterRole.calculateAttackDamage(6, 3)
    const minOne = monsterRole.calculateAttackDamage(2, 10)

    expect(reduced).toBe(2)
    expect(minOne).toBe(1)
  })

  it('picks chase step by dominant axis', () => {
    const monsterRole = new MonsterRoleService(() => 0)
    expect(monsterRole.getChaseStep({ x: 1, y: 1 }, { x: 5, y: 2 })).toEqual({
      x: 1,
      y: 0,
    })
    expect(monsterRole.getChaseStep({ x: 5, y: 5 }, { x: 5, y: 2 })).toEqual({
      x: 0,
      y: -1,
    })
  })

  it('uses vertical step when axis distance is tied', () => {
    const monsterRole = new MonsterRoleService(() => 0)
    expect(monsterRole.getChaseStep({ x: 1, y: 1 }, { x: 3, y: 3 })).toEqual({
      x: 0,
      y: 1,
    })
  })
})

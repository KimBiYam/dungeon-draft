import { describe, expect, it } from 'vitest'

import {
  MonsterTypeCatalog,
  scaleMonsterStats,
} from '../monsterTypes'

describe('monster types', () => {
  it('has at least 10 monster types', () => {
    const catalog = new MonsterTypeCatalog()
    expect(catalog.list().length).toBeGreaterThanOrEqual(10)
  })

  it('resolves type by id and exposes display metadata', () => {
    const catalog = new MonsterTypeCatalog()
    const slime = catalog.getById('slime')

    expect(slime.name).toBe('Slime')
    expect(slime.tint).toBeTypeOf('number')
  })

  it('scales stats by floor', () => {
    const catalog = new MonsterTypeCatalog()
    const base = catalog.getById('goblin')
    const scaled = scaleMonsterStats(base, 4)

    expect(scaled.maxHp).toBe(base.baseHp + base.hpPerFloor * 3)
    expect(scaled.atk).toBe(base.baseAtk + base.atkPerFloor * 3)
  })
})

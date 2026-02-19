import { describe, expect, it } from 'vitest'

import { LootService } from '../lootService'
import type { RunState } from '../model'

function createRun(overrides: Partial<RunState> = {}): RunState {
  return {
    heroClass: 'knight',
    floor: 1,
    turn: 0,
    hp: 20,
    maxHp: 32,
    atk: 7,
    def: 1,
    level: 1,
    xp: 0,
    nextXp: 16,
    player: { x: 1, y: 1 },
    floorData: {
      width: 12,
      height: 8,
      walls: new Set(),
      enemies: [],
      potions: [],
      traps: [],
      chests: [],
      events: [],
      exit: { x: 2, y: 2 },
    },
    gameOver: false,
    ...overrides,
  }
}

describe('loot service', () => {
  it('resolves trap damage by trap kind', () => {
    const service = new LootService(() => 6)
    expect(service.applyTrapEffect('spike')).toBe(6)
    expect(service.applyTrapEffect('flame')).toBe(6)
    expect(service.applyTrapEffect('venom')).toBe(6)
  })

  it('applies rare chest reward stat gain', () => {
    const run = createRun({ atk: 6, def: 1 })
    const service = new LootService(() => 0)

    const log = service.applyChestReward(run, 'rare')

    expect(log).toContain('ATK +2')
    expect(run.atk).toBe(8)
  })

  it('applies common chest heal path', () => {
    const run = createRun({ hp: 10, maxHp: 20 })
    const service = new LootService((min, max) => {
      if (min === 0 && max === 1) return 0
      return 7
    })

    const log = service.applyChestReward(run, 'common')

    expect(log).toContain('+7 HP')
    expect(run.hp).toBe(17)
  })
})

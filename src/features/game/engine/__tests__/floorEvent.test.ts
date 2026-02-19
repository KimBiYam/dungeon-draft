import { describe, expect, it } from 'vitest'

import type { RunState } from '../model'
import { FloorEventService } from '../floorEvent'

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

describe('floor events', () => {
  it('provides three options per event tile', () => {
    const service = new FloorEventService(() => 1)
    expect(service.createChoices('shop')).toHaveLength(3)
    expect(service.createChoices('altar')).toHaveLength(3)
    expect(service.createChoices('gamble')).toHaveLength(3)
  })

  it('applies shop option effects', () => {
    const run = createRun({ hp: 12, maxHp: 24, def: 1 })
    const service = new FloorEventService(() => 1)

    const log = service.applyChoice(run, 'shop', 'shop-harden')

    expect(log).toContain('DEF +1')
    expect(run.def).toBe(2)
    expect(run.maxHp).toBe(28)
    expect(run.hp).toBe(16)
  })

  it('resolves gamble outcomes from injected roll', () => {
    const winRun = createRun({ atk: 6, hp: 20 })
    const loseRun = createRun({ atk: 6, hp: 20 })
    const winService = new FloorEventService(() => 1)
    const loseService = new FloorEventService(() => 0)

    const winLog = winService.applyChoice(winRun, 'gamble', 'gamble-dice')
    const loseLog = loseService.applyChoice(loseRun, 'gamble', 'gamble-dice')

    expect(winLog).toContain('ATK +3')
    expect(winRun.atk).toBe(9)
    expect(loseLog).toContain('take 8 damage')
    expect(loseRun.hp).toBe(12)
  })
})

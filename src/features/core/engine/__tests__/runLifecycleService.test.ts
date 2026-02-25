import { describe, expect, it } from 'vitest'

import type { RunState } from '../model'
import { RunLifecycleService } from '../runLifecycleService'

function createRun(overrides: Partial<RunState> = {}): RunState {
  return {
    heroClass: 'knight',
    floor: 2,
    turn: 0,
    hp: 20,
    maxHp: 24,
    atk: 7,
    def: 1,
    level: 1,
    xp: 0,
    nextXp: 16,
    player: { x: 3, y: 3 },
    floorData: {
      width: 12,
      height: 8,
      walls: new Set(),
      enemies: [],
      potions: [],
      traps: [],
      chests: [],
      events: [],
      exit: { x: 10, y: 6 },
    },
    gameOver: false,
    ...overrides,
  }
}

describe('run lifecycle service', () => {
  it('marks run as game over only once', () => {
    const service = new RunLifecycleService()
    const run = createRun()
    expect(service.markGameOver(run)).toBe(true)
    expect(run.gameOver).toBe(true)
    expect(run.hp).toBe(0)
    expect(service.markGameOver(run)).toBe(false)
  })

  it('descends floor and resets player position', () => {
    const service = new RunLifecycleService()
    const run = createRun({ floor: 3, hp: 10, maxHp: 20 })

    service.descendFloor(run)

    expect(run.floor).toBe(4)
    expect(run.player).toEqual({ x: 1, y: 1 })
    expect(run.hp).toBeGreaterThan(10)
    expect(run.hp).toBeLessThanOrEqual(run.maxHp)
  })
})

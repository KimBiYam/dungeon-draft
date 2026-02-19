import { describe, expect, it } from 'vitest'

import type { RunState } from '../model'
import { TerrainRoleService } from '../terrain'

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
      exit: { x: 4, y: 4 },
    },
    gameOver: false,
    ...overrides,
  }
}

describe('terrain role logic', () => {
  it('finds nearby traps by reveal radius', () => {
    const terrain = new TerrainRoleService()
    const keys = terrain.getNearbyTrapKeys(
      { x: 4, y: 4 },
      [
        { pos: { x: 4, y: 5 }, kind: 'spike' },
        { pos: { x: 6, y: 6 }, kind: 'flame' },
      ],
      1,
    )

    expect(keys).toHaveLength(1)
    expect(keys[0]).toBe('4,5')
  })

  it('detects portal resonance tile by adjacency', () => {
    const terrain = new TerrainRoleService()
    expect(terrain.isPortalResonanceTile({ x: 3, y: 4 }, { x: 4, y: 4 })).toBe(true)
    expect(terrain.isPortalResonanceTile({ x: 2, y: 4 }, { x: 4, y: 4 })).toBe(false)
  })

  it('applies portal resonance heal', () => {
    const terrain = new TerrainRoleService()
    const run = createRun({ hp: 21, maxHp: 22 })

    const heal = terrain.applyPortalResonance(run)

    expect(heal).toBe(2)
    expect(run.hp).toBe(22)
  })
})

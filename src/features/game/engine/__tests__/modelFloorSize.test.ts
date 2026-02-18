import { describe, expect, it } from 'vitest'

import {
  MAX_MAP_H,
  MAX_MAP_W,
  MIN_MAP_H,
  MIN_MAP_W,
  START_POS,
  createFloor,
  keyOf,
} from '../model'

describe('createFloor map size randomization', () => {
  it('always creates floor dimensions within configured range', () => {
    for (let i = 0; i < 200; i++) {
      const floor = createFloor(1)
      expect(floor.width).toBeGreaterThanOrEqual(MIN_MAP_W)
      expect(floor.width).toBeLessThanOrEqual(MAX_MAP_W)
      expect(floor.height).toBeGreaterThanOrEqual(MIN_MAP_H)
      expect(floor.height).toBeLessThanOrEqual(MAX_MAP_H)
    }
  })

  it('never places enemies or potions or exit on the start tile', () => {
    const startKey = keyOf(START_POS)

    for (let i = 0; i < 100; i++) {
      const floor = createFloor(2)
      const occupied = [
        ...floor.enemies.map((enemy) => keyOf(enemy.pos)),
        ...floor.potions.map((potion) => keyOf(potion)),
        keyOf(floor.exit),
      ]
      expect(occupied).not.toContain(startKey)
    }
  })
})

import { describe, expect, it } from 'vitest'

import { MAX_MAP_H, MAX_MAP_W, MIN_MAP_H, MIN_MAP_W, createFloor } from '../model'

describe('floor size generation', () => {
  it('creates floor size within configured random bounds', () => {
    const floor = createFloor(1)

    expect(floor.width).toBeGreaterThanOrEqual(MIN_MAP_W)
    expect(floor.width).toBeLessThanOrEqual(MAX_MAP_W)
    expect(floor.height).toBeGreaterThanOrEqual(MIN_MAP_H)
    expect(floor.height).toBeLessThanOrEqual(MAX_MAP_H)
  })

  it('keeps all enemies inside generated floor bounds', () => {
    const floor = createFloor(3)

    for (const enemy of floor.enemies) {
      expect(enemy.pos.x).toBeGreaterThan(0)
      expect(enemy.pos.x).toBeLessThan(floor.width - 1)
      expect(enemy.pos.y).toBeGreaterThan(0)
      expect(enemy.pos.y).toBeLessThan(floor.height - 1)
    }
  })
})

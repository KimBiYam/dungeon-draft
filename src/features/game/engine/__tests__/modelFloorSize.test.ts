import { describe, expect, it } from 'vitest'

import {
  MAX_MAP_H,
  MAX_MAP_W,
  MIN_MAP_H,
  MIN_MAP_W,
  START_POS,
  createFloor,
  createInitialRun,
  createInitialRunWithMeta,
  keyOf,
} from '../model'

describe('createFloor map size randomization', () => {
  it('always places an exit reachable from the start tile', () => {
    const deltas = [
      { x: 1, y: 0 },
      { x: -1, y: 0 },
      { x: 0, y: 1 },
      { x: 0, y: -1 },
    ]

    const canReachExit = (floor: ReturnType<typeof createFloor>) => {
      const queue = [{ ...START_POS }]
      const visited = new Set<string>([keyOf(START_POS)])

      while (queue.length > 0) {
        const current = queue.shift()
        if (!current) {
          continue
        }
        if (keyOf(current) === keyOf(floor.exit)) {
          return true
        }

        for (const delta of deltas) {
          const next = { x: current.x + delta.x, y: current.y + delta.y }
          if (
            next.x < 0 ||
            next.y < 0 ||
            next.x >= floor.width ||
            next.y >= floor.height
          ) {
            continue
          }

          const nextKey = keyOf(next)
          if (visited.has(nextKey) || floor.walls.has(nextKey)) {
            continue
          }
          visited.add(nextKey)
          queue.push(next)
        }
      }

      return false
    }

    for (let i = 0; i < 300; i++) {
      const floor = createFloor(1)
      expect(canReachExit(floor)).toBe(true)
    }
  })

  it('always creates floor dimensions within configured range', () => {
    for (let i = 0; i < 200; i++) {
      const floor = createFloor(1)
      expect(floor.width).toBeGreaterThanOrEqual(MIN_MAP_W)
      expect(floor.width).toBeLessThanOrEqual(MAX_MAP_W)
      expect(floor.height).toBeGreaterThanOrEqual(MIN_MAP_H)
      expect(floor.height).toBeLessThanOrEqual(MAX_MAP_H)
    }
  })

  it('never places objects on the start tile', () => {
    const startKey = keyOf(START_POS)

    for (let i = 0; i < 100; i++) {
      const floor = createFloor(2)
      const occupied = [
        ...floor.enemies.map((enemy) => keyOf(enemy.pos)),
        ...floor.potions.map((potion) => keyOf(potion)),
        ...floor.traps.map((trap) => keyOf(trap.pos)),
        ...floor.chests.map((chest) => keyOf(chest.pos)),
        ...floor.events.map((eventTile) => keyOf(eventTile.pos)),
        keyOf(floor.exit),
      ]
      expect(occupied).not.toContain(startKey)
    }
  })

  it('applies class-based base stats on run creation', () => {
    const knight = createInitialRun('knight')
    const berserker = createInitialRun('berserker')
    const ranger = createInitialRun('ranger')

    expect(knight.heroClass).toBe('knight')
    expect(berserker.heroClass).toBe('berserker')
    expect(ranger.heroClass).toBe('ranger')
    expect(knight.maxHp).toBeGreaterThan(ranger.maxHp)
    expect(berserker.atk).toBeGreaterThan(knight.atk)
  })

  it('applies meta start bonuses on run creation', () => {
    const run = createInitialRunWithMeta('knight', {
      bonusMaxHp: 2,
      bonusStartPotions: 1,
    })

    expect(run.maxHp).toBe(38)
    expect(run.hp).toBe(38)
    expect(run.floorData.potions.length).toBeGreaterThanOrEqual(3)
  })
})

import { describe, expect, it, vi } from 'vitest'

import { FloorEventFlow } from '../floorEventFlow'
import type { FloorEventChoice } from '../floorEvent'
import type { RunState } from '../model'

function createRun(overrides: Partial<RunState> = {}): RunState {
  return {
    heroClass: 'knight',
    floor: 1,
    turn: 0,
    hp: 20,
    maxHp: 24,
    atk: 6,
    def: 2,
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
      events: [{ id: 'evt-1', kind: 'shop', pos: { x: 3, y: 3 } }],
      exit: { x: 10, y: 6 },
    },
    gameOver: false,
    ...overrides,
  }
}

function createChoices(): FloorEventChoice[] {
  return [
    { id: 'shop-harden', title: 'A', description: 'd1' },
    { id: 'shop-sharpen', title: 'B', description: 'd2' },
    { id: 'shop-supplies', title: 'C', description: 'd3' },
  ]
}

describe('floor event flow', () => {
  it('offers floor event choices and logs prompt', () => {
    const choices = createChoices()
    const floorEventRole = {
      createChoices: vi.fn(() => choices),
      applyChoice: vi.fn(() => 'applied'),
    }
    const notifier = {
      setFloorEventChoices: vi.fn(),
      clearFloorEventChoices: vi.fn(),
      pushLog: vi.fn(),
    }
    const flow = new FloorEventFlow(floorEventRole, notifier)
    const run = createRun()
    const tile = run.floorData.events[0]

    flow.offer(tile)

    expect(flow.hasActiveChoices()).toBe(true)
    expect(flow.getActiveChoices()).toEqual(choices)
    expect(notifier.setFloorEventChoices).toHaveBeenCalledWith(choices)
    expect(notifier.pushLog).toHaveBeenCalledWith('SHOP event: choose your option.')
  })

  it('applies choice, removes event tile, and clears choices', () => {
    const floorEventRole = {
      createChoices: vi.fn(() => createChoices()),
      applyChoice: vi.fn(() => 'Merchant reforges your gear. DEF +1, Max HP +4.'),
    }
    const notifier = {
      setFloorEventChoices: vi.fn(),
      clearFloorEventChoices: vi.fn(),
      pushLog: vi.fn(),
    }
    const flow = new FloorEventFlow(floorEventRole, notifier)
    const run = createRun()
    const tile = run.floorData.events[0]
    flow.offer(tile)

    const result = flow.choose(run, 'shop-harden')

    expect(result).toEqual({
      consumedPos: { x: 3, y: 3 },
      log: 'Merchant reforges your gear. DEF +1, Max HP +4.',
      resultedInDeath: false,
    })
    expect(run.floorData.events).toHaveLength(0)
    expect(flow.hasActiveChoices()).toBe(false)
    expect(notifier.clearFloorEventChoices).toHaveBeenCalled()
  })

  it('marks death when event effect drops hp to zero', () => {
    const floorEventRole = {
      createChoices: vi.fn(() => createChoices()),
      applyChoice: vi.fn((run: RunState) => {
        run.hp = 0
        return 'event log'
      }),
    }
    const notifier = {
      setFloorEventChoices: vi.fn(),
      clearFloorEventChoices: vi.fn(),
      pushLog: vi.fn(),
    }
    const flow = new FloorEventFlow(floorEventRole, notifier)
    const run = createRun({ hp: 5 })
    flow.offer(run.floorData.events[0])

    const result = flow.choose(run, 'shop-sharpen')

    expect(result?.resultedInDeath).toBe(true)
  })
})

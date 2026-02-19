import { describe, expect, it, vi } from 'vitest'

import { PlayerMoveResolver } from '../playerMoveResolver'
import type { RunState } from '../model'

function createRun(overrides: Partial<RunState> = {}): RunState {
  return {
    heroClass: 'knight',
    floor: 1,
    turn: 0,
    hp: 20,
    maxHp: 24,
    atk: 6,
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
      exit: { x: 10, y: 6 },
    },
    gameOver: false,
    ...overrides,
  }
}

function createResolver(overrides: {
  enemyHandled?: boolean
  tileEffects?: { diedByTrap: boolean; portalResonanceUsed: boolean }
} = {}) {
  const deps = {
    turnResolver: {
      resolveEnemyCollision: vi.fn(() => ({ handled: overrides.enemyHandled ?? false })),
      resolveTileEffects: vi.fn(
        () =>
          overrides.tileEffects ?? {
            diedByTrap: false,
            portalResonanceUsed: false,
          },
      ),
    },
    heroRole: {} as never,
    terrainRole: {} as never,
    visuals: {} as never,
    effects: {
      cameraShake: vi.fn(),
      playOnceThen: vi.fn(),
      hitFlash: vi.fn(),
      trapHitFlash: vi.fn(),
    } as never,
    playAudio: vi.fn(),
    pushLog: vi.fn(),
    lootService: {
      applyTrapEffect: vi.fn(),
      applyChestReward: vi.fn(),
    } as never,
  }

  return { resolver: new PlayerMoveResolver(deps as never), deps }
}

describe('player move resolver', () => {
  it('handles wall collision as blocked', () => {
    const run = createRun({
      floorData: {
        ...createRun().floorData,
        walls: new Set(['2,1']),
      },
    })
    const { resolver, deps } = createResolver()

    const result = resolver.resolve(run, { x: 2, y: 1 }, false)

    expect(result.status).toBe('blocked')
    expect(deps.pushLog).toHaveBeenCalledWith('Blocked by stone wall.')
    expect(deps.playAudio).toHaveBeenCalledWith('wallBlocked')
  })

  it('returns event when landing on event tile', () => {
    const run = createRun({
      floorData: {
        ...createRun().floorData,
        events: [{ id: 'evt1', kind: 'shop', pos: { x: 2, y: 1 } }],
      },
    })
    const { resolver } = createResolver({
      tileEffects: { diedByTrap: false, portalResonanceUsed: true },
    })

    const result = resolver.resolve(run, { x: 2, y: 1 }, false)

    expect(result.status).toBe('event')
    if (result.status === 'event') {
      expect(result.tile.id).toBe('evt1')
      expect(result.portalResonanceUsed).toBe(true)
    }
  })

  it('returns trap_death when trap effect is fatal', () => {
    const run = createRun()
    const { resolver } = createResolver({
      tileEffects: { diedByTrap: true, portalResonanceUsed: false },
    })

    const result = resolver.resolve(run, { x: 2, y: 1 }, false)

    expect(result.status).toBe('trap_death')
  })
})

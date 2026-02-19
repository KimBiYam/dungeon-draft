import { describe, expect, it, vi } from 'vitest'

import { LevelUpFlow } from '../levelUpFlow'
import type { LevelUpChoice } from '../hero'
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
      events: [],
      exit: { x: 10, y: 6 },
    },
    gameOver: false,
    ...overrides,
  }
}

function createChoices(): LevelUpChoice[] {
  return [
    { id: 'a', title: 'A', description: 'desc a', tags: ['offense'] },
    { id: 'b', title: 'B', description: 'desc b', tags: ['sustain'] },
    { id: 'c', title: 'C', description: 'desc c', tags: ['xp'] },
  ]
}

describe('level up flow', () => {
  it('collects pending level-ups and exposes choices', () => {
    const choices = createChoices()
    const heroRole = {
      gainPendingLevelUps: vi.fn(() => 1),
      createLevelUpChoices: vi.fn(() => choices),
      applyLevelUpChoice: vi.fn(() => 'picked'),
    }
    const notifier = {
      setLevelUpChoices: vi.fn(),
      clearLevelUpChoices: vi.fn(),
      pushLog: vi.fn(),
    }
    const playAudio = vi.fn()
    const flow = new LevelUpFlow(heroRole, notifier, playAudio)
    const run = createRun()

    const started = flow.collectPending(run)

    expect(started).toBe(true)
    expect(flow.hasActiveChoices()).toBe(true)
    expect(flow.getActiveChoices()).toEqual(choices)
    expect(heroRole.createLevelUpChoices).toHaveBeenCalledWith('knight', 3)
    expect(notifier.setLevelUpChoices).toHaveBeenCalledWith(choices)
    expect(notifier.pushLog).toHaveBeenCalledWith('Level up! Choose one card.')
  })

  it('applies selected choice and clears modal when queue is done', () => {
    const heroRole = {
      gainPendingLevelUps: vi.fn(() => 1),
      createLevelUpChoices: vi.fn(() => createChoices()),
      applyLevelUpChoice: vi.fn(() => 'Card picked: A'),
    }
    const notifier = {
      setLevelUpChoices: vi.fn(),
      clearLevelUpChoices: vi.fn(),
      pushLog: vi.fn(),
    }
    const playAudio = vi.fn()
    const flow = new LevelUpFlow(heroRole, notifier, playAudio)
    const run = createRun()
    flow.collectPending(run)

    const result = flow.choose(run, 'a', 'knight')

    expect(result).toBe('Card picked: A')
    expect(heroRole.applyLevelUpChoice).toHaveBeenCalledWith(run, 'a', 'knight')
    expect(playAudio).toHaveBeenCalledTimes(1)
    expect(flow.hasActiveChoices()).toBe(false)
    expect(notifier.clearLevelUpChoices).toHaveBeenCalled()
  })

  it('resets active state and clears notifier choices', () => {
    const heroRole = {
      gainPendingLevelUps: vi.fn(() => 1),
      createLevelUpChoices: vi.fn(() => createChoices()),
      applyLevelUpChoice: vi.fn(() => 'Card picked: A'),
    }
    const notifier = {
      setLevelUpChoices: vi.fn(),
      clearLevelUpChoices: vi.fn(),
      pushLog: vi.fn(),
    }
    const playAudio = vi.fn()
    const flow = new LevelUpFlow(heroRole, notifier, playAudio)
    const run = createRun()
    flow.collectPending(run)

    flow.reset()

    expect(flow.hasActiveChoices()).toBe(false)
    expect(notifier.clearLevelUpChoices).toHaveBeenCalled()
  })
})

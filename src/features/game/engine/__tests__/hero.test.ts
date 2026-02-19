import { describe, expect, it } from 'vitest'

import type { RunState } from '../model'
import { HeroRoleService } from '../hero'

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

describe('hero role logic', () => {
  it('calculates hero attack damage with expected range', () => {
    let called: [number, number] | null = null
    const heroRole = new HeroRoleService((min, max) => {
      called = [min, max]
      return min
    })
    const damage = heroRole.calculateAttackDamage(1)

    expect(called).toEqual([1, 4])
    expect(damage).toBe(1)
  })

  it('converts xp into pending level-up counts', () => {
    const run = createRun({ xp: 40, nextXp: 16 })
    const heroRole = new HeroRoleService(() => 0)

    const gained = heroRole.gainPendingLevelUps(run)

    expect(gained).toBe(2)
    expect(run.level).toBe(3)
    expect(run.xp).toBe(3)
    expect(run.nextXp).toBe(27)
  })

  it('creates unique random level-up choices', () => {
    const heroRole = new HeroRoleService(() => 0)
    const picks = heroRole.createLevelUpChoices('knight', 3)

    expect(picks).toHaveLength(3)
    expect(new Set(picks.map((pick) => pick.id)).size).toBe(3)
  })

  it('includes class-specific choices in pool', () => {
    const heroRole = new HeroRoleService(() => 0)
    const picks = heroRole.createLevelUpChoices('berserker', 12)

    expect(picks.some((pick) => pick.id.startsWith('berserker-'))).toBe(true)
  })

  it('builds level-up choices with class-common split', () => {
    const heroRole = new HeroRoleService(() => 0)
    const picks = heroRole.createLevelUpChoices('knight', 3)

    expect(picks).toHaveLength(3)
    expect(picks.filter((pick) => pick.id.startsWith('knight-'))).toHaveLength(2)
    expect(picks.filter((pick) => !pick.id.startsWith('knight-'))).toHaveLength(1)
  })

  it('biases future choices toward previously selected tags', () => {
    const run = createRun()
    const heroRole = new HeroRoleService(() => 2)

    heroRole.applyLevelUpChoice(run, 'power-strike', 'knight')
    const picks = heroRole.createLevelUpChoices('knight', 2)
    const commonPick = picks.find((pick) => !pick.id.startsWith('knight-'))

    expect(commonPick?.id).toBe('power-strike')
  })

  it('resets build synergy on new run', () => {
    const run = createRun()
    const heroRole = new HeroRoleService(() => 2)

    heroRole.applyLevelUpChoice(run, 'power-strike', 'knight')
    heroRole.resetBuildSynergy()
    const picks = heroRole.createLevelUpChoices('knight', 2)
    const commonPick = picks.find((pick) => !pick.id.startsWith('knight-'))

    expect(commonPick?.id).toBe('iron-hide')
  })

  it('applies selected level-up reward to run', () => {
    const run = createRun({ atk: 7 })
    const heroRole = new HeroRoleService(() => 0)

    const log = heroRole.applyLevelUpChoice(run, 'power-strike', 'knight')

    expect(log).toContain('Power Strike')
    expect(run.atk).toBe(9)
  })
})

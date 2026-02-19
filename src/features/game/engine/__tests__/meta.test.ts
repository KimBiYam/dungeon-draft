import { describe, expect, it } from 'vitest'

import { calculateRunMetaXpReward, getUnlockedMetaUpgrades, resolveMetaRunBonuses } from '../meta'
import { createInitialRun } from '../model'

describe('meta progression', () => {
  it('calculates run reward from floor and level', () => {
    const run = createInitialRun('knight')
    run.floor = 4
    run.level = 3

    expect(calculateRunMetaXpReward(run)).toBe(33)
  })

  it('unlocks upgrades at thresholds', () => {
    expect(getUnlockedMetaUpgrades(39)).toEqual([])
    expect(getUnlockedMetaUpgrades(40)).toEqual(['starter-cache'])
    expect(getUnlockedMetaUpgrades(80)).toEqual(['starter-cache', 'vital-training'])
  })

  it('resolves run bonuses from unlocked upgrades', () => {
    expect(
      resolveMetaRunBonuses({
        metaXp: 100,
        unlocked: ['starter-cache', 'vital-training'],
      }),
    ).toEqual({
      bonusStartPotions: 1,
      bonusMaxHp: 2,
    })
  })
})

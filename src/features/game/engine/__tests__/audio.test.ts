import { describe, expect, it } from 'vitest'

import { clampVolume, createSfxPattern } from '../audio'

describe('createSfxPattern', () => {
  it('returns meaningful steps for combat and progression events', () => {
    expect(createSfxPattern('heroAttack')).toHaveLength(2)
    expect(createSfxPattern('enemyDefeat').length).toBeGreaterThan(1)
    expect(createSfxPattern('levelUp').length).toBeGreaterThan(1)
  })

  it('keeps death sound descending in pitch', () => {
    const steps = createSfxPattern('death')
    expect(steps.length).toBeGreaterThan(2)
    expect(steps[0].frequency).toBeGreaterThan(steps[steps.length - 1].frequency)
  })

  it('uses only positive durations and frequencies', () => {
    const events = ['runStart', 'pickupGold', 'wallBlocked'] as const

    for (const event of events) {
      for (const step of createSfxPattern(event)) {
        expect(step.frequency).toBeGreaterThan(0)
        expect(step.duration).toBeGreaterThan(0)
      }
    }
  })
})

describe('clampVolume', () => {
  it('clamps into 0..1', () => {
    expect(clampVolume(-1)).toBe(0)
    expect(clampVolume(0.5)).toBe(0.5)
    expect(clampVolume(5)).toBe(1)
  })
})

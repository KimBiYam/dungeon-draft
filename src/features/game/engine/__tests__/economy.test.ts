import { describe, expect, it } from 'vitest'

import { getArmorUpgradeCost, getWeaponUpgradeCost } from '../economy'

describe('economy', () => {
  it('scales weapon upgrade cost by level', () => {
    expect(getWeaponUpgradeCost(1)).toBe(24)
    expect(getWeaponUpgradeCost(2)).toBe(36)
    expect(getWeaponUpgradeCost(4)).toBe(60)
  })

  it('scales armor upgrade cost by level', () => {
    expect(getArmorUpgradeCost(1)).toBe(22)
    expect(getArmorUpgradeCost(2)).toBe(34)
    expect(getArmorUpgradeCost(4)).toBe(58)
  })
})

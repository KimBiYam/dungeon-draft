export const GOLD_HEAL_COST = 18
export const GOLD_HEAL_AMOUNT = 12
export const GOLD_WEAPON_UPGRADE_BASE_COST = 24
export const GOLD_ARMOR_UPGRADE_BASE_COST = 22
export const GOLD_UPGRADE_COST_STEP = 12

export function getWeaponUpgradeCost(weaponLevel: number) {
  return GOLD_WEAPON_UPGRADE_BASE_COST + (Math.max(1, weaponLevel) - 1) * GOLD_UPGRADE_COST_STEP
}

export function getArmorUpgradeCost(armorLevel: number) {
  return GOLD_ARMOR_UPGRADE_BASE_COST + (Math.max(1, armorLevel) - 1) * GOLD_UPGRADE_COST_STEP
}

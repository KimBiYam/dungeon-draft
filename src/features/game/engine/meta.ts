import { type RunState } from './model'

export type MetaUpgradeId = 'starter-cache' | 'vital-training'

export type MetaProgress = {
  metaXp: number
  unlocked: MetaUpgradeId[]
}

export type MetaRunBonuses = {
  bonusStartPotions: number
  bonusMaxHp: number
}

export type MetaUpgradeDefinition = {
  id: MetaUpgradeId
  title: string
  description: string
  requiredMetaXp: number
}

export const META_UPGRADES: MetaUpgradeDefinition[] = [
  {
    id: 'starter-cache',
    title: 'Starter Cache',
    description: 'Start each run with +1 potion nearby.',
    requiredMetaXp: 40,
  },
  {
    id: 'vital-training',
    title: 'Vital Training',
    description: 'Start each run with +2 Max HP.',
    requiredMetaXp: 80,
  },
]

export const initialMetaProgress: MetaProgress = {
  metaXp: 0,
  unlocked: [],
}

export function getMetaUpgradeDefinition(id: MetaUpgradeId) {
  return META_UPGRADES.find((upgrade) => upgrade.id === id)
}

export function calculateRunMetaXpReward(run: RunState) {
  return Math.max(10, run.floor * 6 + run.level * 3)
}

export function getUnlockedMetaUpgrades(metaXp: number) {
  return META_UPGRADES.filter((upgrade) => metaXp >= upgrade.requiredMetaXp).map(
    (upgrade) => upgrade.id,
  )
}

export function resolveMetaRunBonuses(progress: MetaProgress): MetaRunBonuses {
  const unlocked = new Set(progress.unlocked)
  return {
    bonusStartPotions: unlocked.has('starter-cache') ? 1 : 0,
    bonusMaxHp: unlocked.has('vital-training') ? 2 : 0,
  }
}

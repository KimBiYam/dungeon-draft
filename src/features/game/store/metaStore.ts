import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { getUnlockedMetaUpgrades, initialMetaProgress } from '../engine/meta'
import type { MetaStoreState } from './types'

export const useMetaStore = create<MetaStoreState>()(
  persist(
    (set, get) => ({
      progress: initialMetaProgress,
      applyRunMetaXp: (reward) => {
        const prev = get().progress
        const nextMetaXp = prev.metaXp + Math.max(0, reward)
        const unlocked = getUnlockedMetaUpgrades(nextMetaXp)
        const unlockedNow = unlocked.filter((id) => !prev.unlocked.includes(id))
        set({
          progress: {
            metaXp: nextMetaXp,
            unlocked,
          },
        })
        return { unlockedNow }
      },
    }),
    {
      name: 'dungeon-draft-meta-progress',
    },
  ),
)

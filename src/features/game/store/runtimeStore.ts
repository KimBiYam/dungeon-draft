import { create } from 'zustand'

import { useSessionStore } from './sessionStore'
import type { RuntimeStoreState } from './types'

export const useRuntimeStore = create<RuntimeStoreState>((set, get) => ({
  api: null,
  setApi: (api) => {
    const prevApi = get().api
    if (prevApi && prevApi !== api) {
      prevApi.destroy()
    }
    set({ api })
  },
  newRun: () => {
    get().api?.newRun()
    useSessionStore.getState().resetSessionState()
  },
  pickLevelUpChoice: (choiceId) => {
    get().api?.chooseLevelUpReward(choiceId)
  },
}))

import type { StateCreator } from 'zustand'

import { syncApiSettings } from './storeHelpers'
import type { GameUiStore, RuntimeSlice } from './types'

export const createRuntimeStore: StateCreator<
  GameUiStore,
  [],
  [],
  RuntimeSlice
> = (set, get) => ({
  api: null,
  setApi: (api) => {
    const prevApi = get().api
    if (prevApi && prevApi !== api) {
      prevApi.destroy()
    }
    set({ api })
    syncApiSettings(get())
  },
  newRun: () => {
    get().api?.newRun()
    get().resetSessionState()
  },
  pickLevelUpChoice: (choiceId) => {
    get().api?.chooseLevelUpReward(choiceId)
  },
})

import type { StateCreator } from 'zustand'

import type { GameUiStore, SessionSlice } from './types'
import { initialHud } from './types'

export const createSessionStore: StateCreator<
  GameUiStore,
  [],
  [],
  SessionSlice
> = (set) => ({
  hud: initialHud,
  logs: [],
  levelUpChoices: null,
  setHud: (hud) => set({ hud }),
  pushLog: (line) => set((state) => ({ logs: [line, ...state.logs].slice(0, 14) })),
  resetSessionState: () => set({ logs: [], levelUpChoices: null }),
  setLevelUpChoices: (choices) => set({ levelUpChoices: choices }),
})

import { create } from 'zustand'

import { initialHud, type SessionStoreState } from './types'

export const useSessionStore = create<SessionStoreState>((set) => ({
  heroClass: 'knight',
  hud: initialHud,
  logs: [],
  levelUpChoices: null,
  setHud: (hud) => set({ hud }),
  setHeroClass: (heroClass) => set({ heroClass }),
  pushLog: (line) => set((state) => ({ logs: [line, ...state.logs].slice(0, 14) })),
  resetSessionState: () => set({ logs: [], levelUpChoices: null }),
  setLevelUpChoices: (choices) => set({ levelUpChoices: choices }),
}))

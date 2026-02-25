import { create } from 'zustand'

import type { UiStoreState } from './types'

export const useUiStore = create<UiStoreState>((set) => ({
  uiBlockedByWidget: false,
  uiBlockedByStatusPanel: false,
  isInitialClassSelectOpen: true,
  isNewRunConfirmOpen: false,
  isDeathRestartOpen: false,
  setUiInputBlockedByWidget: (blocked) => set({ uiBlockedByWidget: blocked }),
  setUiInputBlockedByStatusPanel: (blocked) => set({ uiBlockedByStatusPanel: blocked }),
  closeInitialClassSelect: () => set({ isInitialClassSelectOpen: false }),
  openNewRunConfirm: () => set({ isNewRunConfirmOpen: true }),
  closeNewRunConfirm: () => set({ isNewRunConfirmOpen: false }),
  openDeathRestart: () => set({ isDeathRestartOpen: true }),
  closeDeathRestart: () => set({ isDeathRestartOpen: false }),
}))

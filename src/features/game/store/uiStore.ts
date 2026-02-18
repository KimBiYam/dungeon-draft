import { create } from 'zustand'

import type { UiStoreState } from './types'

export const useUiStore = create<UiStoreState>((set) => ({
  uiBlockedByWidget: false,
  uiBlockedByStatusPanel: false,
  isNewRunConfirmOpen: false,
  isDeathRestartOpen: false,
  isHeroClassModalOpen: true,
  setUiInputBlockedByWidget: (blocked) => set({ uiBlockedByWidget: blocked }),
  setUiInputBlockedByStatusPanel: (blocked) => set({ uiBlockedByStatusPanel: blocked }),
  openNewRunConfirm: () => set({ isNewRunConfirmOpen: true }),
  closeNewRunConfirm: () => set({ isNewRunConfirmOpen: false }),
  openDeathRestart: () => set({ isDeathRestartOpen: true }),
  closeDeathRestart: () => set({ isDeathRestartOpen: false }),
  openHeroClassModal: () => set({ isHeroClassModalOpen: true }),
  closeHeroClassModal: () => set({ isHeroClassModalOpen: false }),
}))

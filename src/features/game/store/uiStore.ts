import type { StateCreator } from 'zustand'

import { applyUiInputBlocked } from './storeHelpers'
import type { GameUiStore, UiSlice } from './types'

export const createUiStore: StateCreator<GameUiStore, [], [], UiSlice> = (
  set,
  get,
) => ({
  uiBlockedByWidget: false,
  uiBlockedByStatusPanel: false,
  isNewRunConfirmOpen: false,
  isDeathRestartOpen: false,
  setUiInputBlockedByWidget: (blocked) => {
    set({ uiBlockedByWidget: blocked })
    applyUiInputBlocked(get())
  },
  setUiInputBlockedByStatusPanel: (blocked) => {
    set({ uiBlockedByStatusPanel: blocked })
    applyUiInputBlocked(get())
  },
  openNewRunConfirm: () => set({ isNewRunConfirmOpen: true }),
  closeNewRunConfirm: () => set({ isNewRunConfirmOpen: false }),
  openDeathRestart: () => set({ isDeathRestartOpen: true }),
  closeDeathRestart: () => set({ isDeathRestartOpen: false }),
  confirmNewRun: () => {
    set({ isNewRunConfirmOpen: false, isDeathRestartOpen: false })
    get().newRun()
  },
})

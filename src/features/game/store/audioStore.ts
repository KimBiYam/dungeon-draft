import type { StateCreator } from 'zustand'

import { clampVolume } from '../engine/audio'
import { syncApiSettings } from './storeHelpers'
import type { AudioSlice, GameUiStore } from './types'

export const createAudioStore: StateCreator<GameUiStore, [], [], AudioSlice> = (
  set,
  get,
) => ({
  audioMuted: false,
  audioVolume: 100,
  toggleAudioMuted: () => {
    const next = !get().audioMuted
    set({ audioMuted: next })
    syncApiSettings(get())
  },
  setAudioVolumePercent: (percent) => {
    const clampedPercent = Math.min(100, Math.max(0, Math.round(percent)))
    set({ audioVolume: clampedPercent })
    get().api?.setAudioVolume(clampVolume(clampedPercent / 100))
  },
})

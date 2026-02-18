import { create } from 'zustand'

import type { AudioStoreState } from './types'

export const useAudioStore = create<AudioStoreState>((set, get) => ({
  audioMuted: false,
  audioVolume: 100,
  toggleAudioMuted: () => {
    set({ audioMuted: !get().audioMuted })
  },
  setAudioVolumePercent: (percent) => {
    const clampedPercent = Math.min(100, Math.max(0, Math.round(percent)))
    set({ audioVolume: clampedPercent })
  },
}))

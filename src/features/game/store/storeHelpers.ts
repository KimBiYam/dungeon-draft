import { clampVolume } from '../engine/audio'
import type { GameUiStore } from './types'

export function applyUiInputBlocked(state: Pick<GameUiStore, 'api' | 'uiBlockedByWidget' | 'uiBlockedByStatusPanel'>) {
  state.api?.setUiInputBlocked(state.uiBlockedByWidget || state.uiBlockedByStatusPanel)
}

export function syncApiSettings(state: Pick<GameUiStore, 'api' | 'audioMuted' | 'audioVolume' | 'uiBlockedByWidget' | 'uiBlockedByStatusPanel'>) {
  if (!state.api) {
    return
  }

  applyUiInputBlocked(state)
  state.api.setAudioMuted(state.audioMuted)
  state.api.setAudioVolume(clampVolume(state.audioVolume / 100))
}

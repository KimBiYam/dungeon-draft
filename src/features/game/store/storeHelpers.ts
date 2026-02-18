import { clampVolume } from '../engine/audio'
import type { RoguelikeGameApi } from '../engine/createRoguelikeGame'

export function applyUiInputBlocked(
  api: RoguelikeGameApi | null,
  uiBlockedByWidget: boolean,
  uiBlockedByStatusPanel: boolean,
) {
  api?.setUiInputBlocked(uiBlockedByWidget || uiBlockedByStatusPanel)
}

export function applyAudioSettings(
  api: RoguelikeGameApi | null,
  muted: boolean,
  volumePercent: number,
) {
  if (!api) {
    return
  }

  api.setAudioMuted(muted)
  api.setAudioVolume(clampVolume(volumePercent / 100))
}

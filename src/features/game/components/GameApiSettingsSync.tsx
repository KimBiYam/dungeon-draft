import { useEffect } from 'react'

import { useAudioStore } from '../store/audioStore'
import { useRuntimeStore } from '../store/runtimeStore'
import { applyAudioSettings, applyUiInputBlocked } from '../store/storeHelpers'
import { useUiStore } from '../store/uiStore'

export function GameApiSettingsSync() {
  const api = useRuntimeStore((state) => state.api)
  const audioMuted = useAudioStore((state) => state.audioMuted)
  const audioVolume = useAudioStore((state) => state.audioVolume)
  const uiBlockedByWidget = useUiStore((state) => state.uiBlockedByWidget)
  const uiBlockedByStatusPanel = useUiStore((state) => state.uiBlockedByStatusPanel)

  useEffect(() => {
    applyAudioSettings(api, audioMuted, audioVolume)
    applyUiInputBlocked(api, uiBlockedByWidget, uiBlockedByStatusPanel)
  }, [api, audioMuted, audioVolume, uiBlockedByStatusPanel, uiBlockedByWidget])

  return null
}

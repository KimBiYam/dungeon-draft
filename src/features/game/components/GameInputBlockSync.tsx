import { useEffect } from 'react'

import { useSessionStore } from '../store/sessionStore'
import { useUiStore } from '../store/uiStore'

export function GameInputBlockSync() {
  const levelUpChoices = useSessionStore((state) => state.levelUpChoices)
  const isNewRunConfirmOpen = useUiStore((state) => state.isNewRunConfirmOpen)
  const isDeathRestartOpen = useUiStore((state) => state.isDeathRestartOpen)
  const isHeroClassModalOpen = useUiStore((state) => state.isHeroClassModalOpen)
  const setUiInputBlockedByWidget = useUiStore(
    (state) => state.setUiInputBlockedByWidget,
  )

  useEffect(() => {
    const blocked =
      Boolean(levelUpChoices?.length) ||
      isNewRunConfirmOpen ||
      isDeathRestartOpen ||
      isHeroClassModalOpen
    setUiInputBlockedByWidget(blocked)
  }, [
    isDeathRestartOpen,
    isHeroClassModalOpen,
    isNewRunConfirmOpen,
    levelUpChoices,
    setUiInputBlockedByWidget,
  ])

  return null
}

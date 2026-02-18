import { useEffect } from 'react'

import { useGameUiStore } from '../store/gameUiStore'

export function GameInputBlockSync() {
  const levelUpChoices = useGameUiStore((state) => state.levelUpChoices)
  const isNewRunConfirmOpen = useGameUiStore((state) => state.isNewRunConfirmOpen)
  const isDeathRestartOpen = useGameUiStore((state) => state.isDeathRestartOpen)
  const setUiInputBlockedByWidget = useGameUiStore(
    (state) => state.setUiInputBlockedByWidget,
  )

  useEffect(() => {
    const blocked =
      Boolean(levelUpChoices?.length) || isNewRunConfirmOpen || isDeathRestartOpen
    setUiInputBlockedByWidget(blocked)
  }, [
    isDeathRestartOpen,
    isNewRunConfirmOpen,
    levelUpChoices,
    setUiInputBlockedByWidget,
  ])

  return null
}

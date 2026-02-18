import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { CombatLogPanel } from '../../features/game/components/CombatLogPanel'
import { DeathRestartModal } from '../../features/game/components/DeathRestartModal'
import { HelpModal } from '../../features/game/components/HelpModal'
import { LevelUpChoiceModal } from '../../features/game/components/LevelUpChoiceModal'
import { NewRunConfirmModal } from '../../features/game/components/NewRunConfirmModal'
import RoguelikeCanvas from '../../features/game/components/RoguelikeCanvas'
import { RoguelikeStatusPanel } from '../../features/game/components/RoguelikeStatusPanel'
import { useGameUiStore } from '../../features/game/store/gameUiStore'

export function RoguelikeGameWidget() {
  const [isHelpOpen, setIsHelpOpen] = useState(false)
  const [isNewRunConfirmOpen, setIsNewRunConfirmOpen] = useState(false)
  const [isDeathRestartOpen, setIsDeathRestartOpen] = useState(false)

  const hud = useGameUiStore((state) => state.hud)
  const logs = useGameUiStore((state) => state.logs)
  const levelUpChoices = useGameUiStore((state) => state.levelUpChoices)
  const audioMuted = useGameUiStore((state) => state.audioMuted)
  const audioVolume = useGameUiStore((state) => state.audioVolume)
  const setHud = useGameUiStore((state) => state.setHud)
  const pushLog = useGameUiStore((state) => state.pushLog)
  const newRun = useGameUiStore((state) => state.newRun)
  const setUiInputBlocked = useGameUiStore((state) => state.setUiInputBlocked)
  const setLevelUpChoices = useGameUiStore((state) => state.setLevelUpChoices)
  const pickLevelUpChoice = useGameUiStore((state) => state.pickLevelUpChoice)
  const toggleAudioMuted = useGameUiStore((state) => state.toggleAudioMuted)
  const setAudioVolumePercent = useGameUiStore((state) => state.setAudioVolumePercent)
  const setApi = useGameUiStore((state) => state.setApi)

  const status = useMemo(() => {
    if (hud.gameOver) {
      return `Run Over on Floor ${hud.floor}`
    }
    return `Floor ${hud.floor} · ${hud.enemiesLeft} enemies`
  }, [hud.floor, hud.enemiesLeft, hud.gameOver])

  const prevGameOverRef = useRef(hud.gameOver)

  useEffect(() => {
    if (!prevGameOverRef.current && hud.gameOver) {
      setIsDeathRestartOpen(true)
    }
    if (!hud.gameOver) {
      setIsDeathRestartOpen(false)
    }
    prevGameOverRef.current = hud.gameOver
  }, [hud.gameOver])

  const isAnyModalOpen = useMemo(
    () =>
      isHelpOpen ||
      isNewRunConfirmOpen ||
      isDeathRestartOpen ||
      Boolean(levelUpChoices?.length),
    [isHelpOpen, isNewRunConfirmOpen, isDeathRestartOpen, levelUpChoices],
  )

  useEffect(() => {
    setUiInputBlocked(isAnyModalOpen)
  }, [isAnyModalOpen, setUiInputBlocked])

  const openHelp = useCallback(() => setIsHelpOpen(true), [])
  const closeHelp = useCallback(() => setIsHelpOpen(false), [])
  const requestNewRun = useCallback(() => setIsNewRunConfirmOpen(true), [])
  const cancelNewRun = useCallback(() => setIsNewRunConfirmOpen(false), [])
  const closeDeathRestart = useCallback(() => setIsDeathRestartOpen(false), [])
  const confirmNewRun = useCallback(() => {
    setIsNewRunConfirmOpen(false)
    setIsDeathRestartOpen(false)
    newRun()
  }, [newRun])

  return (
    <>
      <RoguelikeStatusPanel
        hud={hud}
        status={status}
        audioMuted={audioMuted}
        audioVolume={audioVolume}
        onToggleAudioMuted={toggleAudioMuted}
        onAudioVolumeChange={setAudioVolumePercent}
        onOpenHelp={openHelp}
      />

      <section className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RoguelikeCanvas
            onState={setHud}
            onLog={pushLog}
            onLevelUpChoices={setLevelUpChoices}
            onReady={setApi}
          />
        </div>

        <CombatLogPanel logs={logs} onRequestNewRun={requestNewRun} />
      </section>

      <HelpModal open={isHelpOpen} onClose={closeHelp} />
      <LevelUpChoiceModal choices={levelUpChoices} onPick={pickLevelUpChoice} />
      <DeathRestartModal
        open={isDeathRestartOpen}
        onClose={closeDeathRestart}
        onRestart={confirmNewRun}
      />
      <NewRunConfirmModal
        open={isNewRunConfirmOpen}
        onCancel={cancelNewRun}
        onConfirm={confirmNewRun}
      />
    </>
  )
}

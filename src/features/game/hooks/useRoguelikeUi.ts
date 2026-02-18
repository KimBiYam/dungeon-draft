import { useCallback, useMemo, useRef, useState } from 'react'

import { clampVolume } from '../engine/audio'
import type {
  HudState,
  LevelUpChoice,
  RoguelikeGameApi,
} from '../engine/createRoguelikeGame'

const initialHud: HudState = {
  floor: 1,
  hp: 32,
  maxHp: 32,
  atk: 7,
  def: 1,
  level: 1,
  xp: 0,
  nextXp: 16,
  enemiesLeft: 0,
  gameOver: false,
}

export function useRoguelikeUi() {
  const [hud, setHud] = useState<HudState>(initialHud)
  const [logs, setLogs] = useState<string[]>([])
  const [levelUpChoices, setLevelUpChoicesState] = useState<LevelUpChoice[] | null>(null)
  const [audioMuted, setAudioMutedState] = useState(false)
  const [audioVolume, setAudioVolumeState] = useState(100)
  const apiRef = useRef<RoguelikeGameApi | null>(null)
  const uiInputBlockedRef = useRef(false)
  const audioMutedRef = useRef(false)
  const audioVolumeRef = useRef(1)

  const status = useMemo(() => {
    if (hud.gameOver) {
      return `Run Over on Floor ${hud.floor}`
    }
    return `Floor ${hud.floor} · ${hud.enemiesLeft} enemies`
  }, [hud.floor, hud.enemiesLeft, hud.gameOver])

  const pushLog = useCallback((line: string) => {
    setLogs((prev) => [line, ...prev].slice(0, 14))
  }, [])

  const newRun = useCallback(() => {
    apiRef.current?.newRun()
    setLogs([])
    setLevelUpChoicesState(null)
  }, [])

  const setApi = useCallback((api: RoguelikeGameApi | null) => {
    apiRef.current = api
    apiRef.current?.setUiInputBlocked(uiInputBlockedRef.current)
    apiRef.current?.setAudioMuted(audioMutedRef.current)
    apiRef.current?.setAudioVolume(audioVolumeRef.current)
  }, [])

  const setUiInputBlocked = useCallback((blocked: boolean) => {
    uiInputBlockedRef.current = blocked
    apiRef.current?.setUiInputBlocked(blocked)
  }, [])

  const setLevelUpChoices = useCallback((choices: LevelUpChoice[] | null) => {
    setLevelUpChoicesState(choices)
  }, [])

  const pickLevelUpChoice = useCallback((choiceId: string) => {
    apiRef.current?.chooseLevelUpReward(choiceId)
  }, [])

  const toggleAudioMuted = useCallback(() => {
    setAudioMutedState((prev) => {
      const next = !prev
      audioMutedRef.current = next
      apiRef.current?.setAudioMuted(next)
      return next
    })
  }, [])

  const setAudioVolumePercent = useCallback((percent: number) => {
    const clampedPercent = Math.min(100, Math.max(0, Math.round(percent)))
    const normalized = clampVolume(clampedPercent / 100)
    audioVolumeRef.current = normalized
    setAudioVolumeState(clampedPercent)
    apiRef.current?.setAudioVolume(normalized)
  }, [])

  return {
    hud,
    logs,
    status,
    levelUpChoices,
    setHud,
    pushLog,
    newRun,
    setUiInputBlocked,
    setLevelUpChoices,
    pickLevelUpChoice,
    audioMuted,
    audioVolume,
    toggleAudioMuted,
    setAudioVolumePercent,
    setApi,
  }
}

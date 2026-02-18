import { useCallback, useMemo, useRef, useState } from 'react'

import type { HudState, RoguelikeGameApi } from '../engine/createRoguelikeGame'
import { GOLD_HEAL_COST } from '../engine/contracts'
import { getArmorUpgradeCost, getWeaponUpgradeCost } from '../engine/economy'
import { clampVolume } from '../engine/audio'

const initialHud: HudState = {
  floor: 1,
  hp: 32,
  maxHp: 32,
  atk: 7,
  def: 1,
  level: 1,
  weaponLevel: 1,
  armorLevel: 1,
  xp: 0,
  nextXp: 16,
  gold: 0,
  enemiesLeft: 0,
  gameOver: false,
}

export function useRoguelikeUi() {
  const [hud, setHud] = useState<HudState>(initialHud)
  const [logs, setLogs] = useState<string[]>([])
  const [audioMuted, setAudioMutedState] = useState(false)
  const [audioVolume, setAudioVolumeState] = useState(80)
  const apiRef = useRef<RoguelikeGameApi | null>(null)
  const uiInputBlockedRef = useRef(false)
  const audioMutedRef = useRef(false)
  const audioVolumeRef = useRef(0.8)

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

  const spendGoldForHeal = useCallback(() => {
    apiRef.current?.spendGoldForHeal()
  }, [])

  const spendGoldForWeaponUpgrade = useCallback(() => {
    apiRef.current?.spendGoldForWeaponUpgrade()
  }, [])

  const spendGoldForArmorUpgrade = useCallback(() => {
    apiRef.current?.spendGoldForArmorUpgrade()
  }, [])

  const weaponUpgradeCost = getWeaponUpgradeCost(hud.weaponLevel)
  const armorUpgradeCost = getArmorUpgradeCost(hud.armorLevel)

  return {
    hud,
    logs,
    status,
    setHud,
    pushLog,
    newRun,
    setUiInputBlocked,
    audioMuted,
    audioVolume,
    toggleAudioMuted,
    setAudioVolumePercent,
    spendGoldForHeal,
    spendGoldForWeaponUpgrade,
    spendGoldForArmorUpgrade,
    canSpendGoldForHeal: hud.gold >= GOLD_HEAL_COST && hud.hp < hud.maxHp && !hud.gameOver,
    goldHealCost: GOLD_HEAL_COST,
    canUpgradeWeapon: hud.gold >= weaponUpgradeCost && !hud.gameOver,
    canUpgradeArmor: hud.gold >= armorUpgradeCost && !hud.gameOver,
    weaponUpgradeCost,
    armorUpgradeCost,
    setApi,
  }
}

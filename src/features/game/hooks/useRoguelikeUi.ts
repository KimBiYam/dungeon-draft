import { useMemo, useRef, useState } from 'react'

import type { HudState, RoguelikeGameApi } from '../engine/createRoguelikeGame'
import { GOLD_HEAL_COST } from '../engine/contracts'

const initialHud: HudState = {
  floor: 1,
  hp: 32,
  maxHp: 32,
  atk: 7,
  def: 1,
  level: 1,
  xp: 0,
  nextXp: 16,
  gold: 0,
  enemiesLeft: 0,
  gameOver: false,
}

export function useRoguelikeUi() {
  const [hud, setHud] = useState<HudState>(initialHud)
  const [logs, setLogs] = useState<string[]>([])
  const apiRef = useRef<RoguelikeGameApi | null>(null)

  const status = useMemo(() => {
    if (hud.gameOver) {
      return `Run Over on Floor ${hud.floor}`
    }
    return `Floor ${hud.floor} · ${hud.enemiesLeft} enemies`
  }, [hud.floor, hud.enemiesLeft, hud.gameOver])

  const pushLog = (line: string) => {
    setLogs((prev) => [line, ...prev].slice(0, 14))
  }

  const newRun = () => {
    apiRef.current?.newRun()
    setLogs([])
  }

  const setApi = (api: RoguelikeGameApi | null) => {
    apiRef.current = api
  }

  const spendGoldForHeal = () => {
    apiRef.current?.spendGoldForHeal()
  }

  return {
    hud,
    logs,
    status,
    setHud,
    pushLog,
    newRun,
    spendGoldForHeal,
    canSpendGoldForHeal: hud.gold >= GOLD_HEAL_COST && hud.hp < hud.maxHp && !hud.gameOver,
    goldHealCost: GOLD_HEAL_COST,
    setApi,
  }
}

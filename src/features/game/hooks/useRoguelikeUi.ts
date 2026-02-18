import { useMemo, useRef, useState } from 'react'

import type { HudState, RoguelikeGameApi } from '../engine/createRoguelikeGame'

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

  return {
    hud,
    logs,
    status,
    setHud,
    pushLog,
    newRun,
    setApi,
  }
}

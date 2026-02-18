import { create } from 'zustand'

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

type GameUiStore = {
  hud: HudState
  logs: string[]
  levelUpChoices: LevelUpChoice[] | null
  audioMuted: boolean
  audioVolume: number
  uiBlockedByWidget: boolean
  uiBlockedByStatusPanel: boolean
  api: RoguelikeGameApi | null
  setHud: (state: HudState) => void
  pushLog: (line: string) => void
  newRun: () => void
  setApi: (api: RoguelikeGameApi | null) => void
  setUiInputBlockedByWidget: (blocked: boolean) => void
  setUiInputBlockedByStatusPanel: (blocked: boolean) => void
  setLevelUpChoices: (choices: LevelUpChoice[] | null) => void
  pickLevelUpChoice: (choiceId: string) => void
  toggleAudioMuted: () => void
  setAudioVolumePercent: (percent: number) => void
}

function applyUiInputBlocked(api: RoguelikeGameApi | null, state: Pick<GameUiStore, 'uiBlockedByWidget' | 'uiBlockedByStatusPanel'>) {
  api?.setUiInputBlocked(state.uiBlockedByWidget || state.uiBlockedByStatusPanel)
}

export const useGameUiStore = create<GameUiStore>((set, get) => ({
  hud: initialHud,
  logs: [],
  levelUpChoices: null,
  audioMuted: false,
  audioVolume: 100,
  uiBlockedByWidget: false,
  uiBlockedByStatusPanel: false,
  api: null,
  setHud: (hud) => set({ hud }),
  pushLog: (line) => set((state) => ({ logs: [line, ...state.logs].slice(0, 14) })),
  newRun: () => {
    get().api?.newRun()
    set({ logs: [], levelUpChoices: null })
  },
  setApi: (api) => {
    set({ api })
    if (!api) return

    const state = get()
    applyUiInputBlocked(api, state)
    api.setAudioMuted(state.audioMuted)
    api.setAudioVolume(clampVolume(state.audioVolume / 100))
  },
  setUiInputBlockedByWidget: (blocked) => {
    set({ uiBlockedByWidget: blocked })
    const state = get()
    applyUiInputBlocked(state.api, state)
  },
  setUiInputBlockedByStatusPanel: (blocked) => {
    set({ uiBlockedByStatusPanel: blocked })
    const state = get()
    applyUiInputBlocked(state.api, state)
  },
  setLevelUpChoices: (choices) => set({ levelUpChoices: choices }),
  pickLevelUpChoice: (choiceId) => {
    get().api?.chooseLevelUpReward(choiceId)
  },
  toggleAudioMuted: () => {
    const next = !get().audioMuted
    set({ audioMuted: next })
    get().api?.setAudioMuted(next)
  },
  setAudioVolumePercent: (percent) => {
    const clampedPercent = Math.min(100, Math.max(0, Math.round(percent)))
    set({ audioVolume: clampedPercent })
    get().api?.setAudioVolume(clampVolume(clampedPercent / 100))
  },
}))

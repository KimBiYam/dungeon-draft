import type {
  HudState,
  LevelUpChoice,
  RoguelikeGameApi,
} from '../engine/createRoguelikeGame'

export const initialHud: HudState = {
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

export type SessionSlice = {
  hud: HudState
  logs: string[]
  levelUpChoices: LevelUpChoice[] | null
  setHud: (state: HudState) => void
  pushLog: (line: string) => void
  resetSessionState: () => void
  setLevelUpChoices: (choices: LevelUpChoice[] | null) => void
}

export type AudioSlice = {
  audioMuted: boolean
  audioVolume: number
  toggleAudioMuted: () => void
  setAudioVolumePercent: (percent: number) => void
}

export type UiSlice = {
  uiBlockedByWidget: boolean
  uiBlockedByStatusPanel: boolean
  isNewRunConfirmOpen: boolean
  isDeathRestartOpen: boolean
  setUiInputBlockedByWidget: (blocked: boolean) => void
  setUiInputBlockedByStatusPanel: (blocked: boolean) => void
  openNewRunConfirm: () => void
  closeNewRunConfirm: () => void
  openDeathRestart: () => void
  closeDeathRestart: () => void
  confirmNewRun: () => void
}

export type RuntimeSlice = {
  api: RoguelikeGameApi | null
  setApi: (api: RoguelikeGameApi | null) => void
  newRun: () => void
  pickLevelUpChoice: (choiceId: string) => void
}

export type GameUiStore = SessionSlice & AudioSlice & UiSlice & RuntimeSlice

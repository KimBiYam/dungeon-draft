import type {
  HeroClassId,
  HudState,
  LevelUpChoice,
  RoguelikeGameApi,
} from '../engine/createRoguelikeGame'

export const initialHud: HudState = {
  heroClass: 'knight',
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

export type SessionStoreState = {
  heroClass: HeroClassId
  hud: HudState
  logs: string[]
  levelUpChoices: LevelUpChoice[] | null
  setHud: (state: HudState) => void
  setHeroClass: (heroClass: HeroClassId) => void
  pushLog: (line: string) => void
  resetSessionState: () => void
  setLevelUpChoices: (choices: LevelUpChoice[] | null) => void
}

export type AudioStoreState = {
  audioMuted: boolean
  audioVolume: number
  toggleAudioMuted: () => void
  setAudioVolumePercent: (percent: number) => void
}

export type UiStoreState = {
  uiBlockedByWidget: boolean
  uiBlockedByStatusPanel: boolean
  isInitialClassSelectOpen: boolean
  isNewRunConfirmOpen: boolean
  isDeathRestartOpen: boolean
  setUiInputBlockedByWidget: (blocked: boolean) => void
  setUiInputBlockedByStatusPanel: (blocked: boolean) => void
  closeInitialClassSelect: () => void
  openNewRunConfirm: () => void
  closeNewRunConfirm: () => void
  openDeathRestart: () => void
  closeDeathRestart: () => void
}

export type RuntimeStoreState = {
  api: RoguelikeGameApi | null
  setApi: (api: RoguelikeGameApi | null) => void
  newRun: (heroClass: HeroClassId) => void
  pickLevelUpChoice: (choiceId: string) => void
}

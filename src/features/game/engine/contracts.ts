import type { LevelUpChoice } from './hero'
import type { HudState } from './model'

export type CreateRoguelikeGameOptions = {
  mount: HTMLElement
  onState: (state: HudState) => void
  onLog: (message: string) => void
  onLevelUpChoices: (choices: LevelUpChoice[] | null) => void
}

export type RoguelikeGameApi = {
  newRun: () => void
  chooseLevelUpReward: (choiceId: string) => void
  setUiInputBlocked: (blocked: boolean) => void
  setAudioMuted: (muted: boolean) => void
  setAudioVolume: (volume: number) => void
  destroy: () => void
}

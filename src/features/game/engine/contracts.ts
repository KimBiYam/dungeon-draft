import type { LevelUpChoice } from './hero'
import type { FloorEventChoice } from './floorEvent'
import type { HeroClassId, HudState } from './model'

export type CreateRoguelikeGameOptions = {
  mount: HTMLElement
  initialHeroClass: HeroClassId
  onState: (state: HudState) => void
  onLog: (message: string) => void
  onLevelUpChoices: (choices: LevelUpChoice[] | null) => void
  onFloorEventChoices: (choices: FloorEventChoice[] | null) => void
}

export type RoguelikeGameApi = {
  newRun: (heroClass: HeroClassId) => void
  chooseLevelUpReward: (choiceId: string) => void
  chooseFloorEventOption: (choiceId: string) => void
  setUiInputBlocked: (blocked: boolean) => void
  setAudioMuted: (muted: boolean) => void
  setAudioVolume: (volume: number) => void
  destroy: () => void
}

import type { HudState } from './model'

export type CreateRoguelikeGameOptions = {
  mount: HTMLElement
  onState: (state: HudState) => void
  onLog: (message: string) => void
}

export type RoguelikeGameApi = {
  newRun: () => void
  destroy: () => void
}

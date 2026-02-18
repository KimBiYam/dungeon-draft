import type { HudState } from './model'

export type CreateRoguelikeGameOptions = {
  mount: HTMLElement
  onState: (state: HudState) => void
  onLog: (message: string) => void
}

export const GOLD_HEAL_COST = 18
export const GOLD_HEAL_AMOUNT = 12

export type RoguelikeGameApi = {
  newRun: () => void
  spendGoldForHeal: () => void
  destroy: () => void
}

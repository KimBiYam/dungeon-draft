import type { HudState } from './model'
export { GOLD_HEAL_AMOUNT, GOLD_HEAL_COST } from './economy'

export type CreateRoguelikeGameOptions = {
  mount: HTMLElement
  onState: (state: HudState) => void
  onLog: (message: string) => void
}

export type RoguelikeGameApi = {
  newRun: () => void
  setUiInputBlocked: (blocked: boolean) => void
  spendGoldForHeal: () => void
  spendGoldForWeaponUpgrade: () => void
  spendGoldForArmorUpgrade: () => void
  destroy: () => void
}

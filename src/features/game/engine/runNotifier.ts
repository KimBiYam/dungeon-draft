import type { CreateRoguelikeGameOptions } from './contracts'
import type { FloorEventChoice } from './floorEvent'
import type { LevelUpChoice } from './hero'
import { toHud, type RunState } from './model'

export class RunNotifier {
  constructor(private readonly callbacks: CreateRoguelikeGameOptions) {}

  pushState(run: RunState) {
    this.callbacks.onState(toHud(run))
  }

  pushLog(message: string) {
    this.callbacks.onLog(message)
  }

  setLevelUpChoices(choices: LevelUpChoice[] | null) {
    this.callbacks.onLevelUpChoices(choices)
  }

  clearLevelUpChoices() {
    this.callbacks.onLevelUpChoices(null)
  }

  setFloorEventChoices(choices: FloorEventChoice[] | null) {
    this.callbacks.onFloorEventChoices(choices)
  }

  clearFloorEventChoices() {
    this.callbacks.onFloorEventChoices(null)
  }

  resetTransientUi() {
    this.clearLevelUpChoices()
    this.clearFloorEventChoices()
  }
}

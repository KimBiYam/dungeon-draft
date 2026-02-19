import { InputMapper } from './input'

type ChoiceLike = {
  id: string
}

type InputControllerDeps = {
  getLevelUpChoices: () => ChoiceLike[] | null
  getFloorEventChoices: () => ChoiceLike[] | null
  isUiInputBlocked: () => boolean
  chooseLevelUpReward: (choiceId: string) => void
  chooseFloorEventOption: (choiceId: string) => void
  processTurn: (dx: number, dy: number) => void
}

export class SceneInputController {
  constructor(
    private readonly inputMapper: InputMapper,
    private readonly deps: InputControllerDeps,
  ) {}

  handleKeyDown(event: KeyboardEvent) {
    if (event.repeat) return

    const levelUpChoiceIndex = this.inputMapper.resolveLevelUpChoiceIndex(
      event.key,
      event.code,
    )
    const levelUpChoices = this.deps.getLevelUpChoices()
    if (levelUpChoices && levelUpChoiceIndex !== null) {
      event.preventDefault()
      const choice = levelUpChoices[levelUpChoiceIndex]
      if (choice) {
        this.deps.chooseLevelUpReward(choice.id)
      }
      return
    }

    const floorEventChoices = this.deps.getFloorEventChoices()
    if (floorEventChoices && levelUpChoiceIndex !== null) {
      event.preventDefault()
      const choice = floorEventChoices[levelUpChoiceIndex]
      if (choice) {
        this.deps.chooseFloorEventOption(choice.id)
      }
      return
    }

    const command = this.inputMapper.resolveCommand(event.key)
    if (!command) return

    event.preventDefault()
    if (this.deps.isUiInputBlocked() || levelUpChoices || floorEventChoices) return
    this.deps.processTurn(command.move.x, command.move.y)
  }
}

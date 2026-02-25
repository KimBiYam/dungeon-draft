import {
  START_POS,
  clamp,
  createFloor,
  createInitialRun,
  type HeroClassId,
  type RunState,
} from './model'

export class RunLifecycleService {
  createNewRun(heroClass: HeroClassId): RunState {
    return createInitialRun(heroClass)
  }

  descendFloor(run: RunState) {
    run.floor += 1
    run.player = { ...START_POS }
    run.floorData = createFloor(run.floor)
    run.hp = clamp(run.hp + 6, 0, run.maxHp)
  }

  markGameOver(run: RunState) {
    if (run.gameOver) {
      return false
    }
    run.hp = 0
    run.gameOver = true
    return true
  }
}

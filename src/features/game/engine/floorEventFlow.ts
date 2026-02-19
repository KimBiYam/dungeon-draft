import type { FloorEventChoice, FloorEventService } from './floorEvent'
import type { FloorEventTile, Pos, RunState } from './model'
import type { RunNotifier } from './runNotifier'

type FloorEventApplier = Pick<FloorEventService, 'createChoices' | 'applyChoice'>
type FloorEventNotifier = Pick<
  RunNotifier,
  'setFloorEventChoices' | 'clearFloorEventChoices' | 'pushLog'
>

type FloorEventResolution = {
  consumedPos: Pos
  log: string
  resultedInDeath: boolean
}

export class FloorEventFlow {
  private activeChoices: FloorEventChoice[] | null = null
  private activeTile: FloorEventTile | null = null

  constructor(
    private readonly floorEventRole: FloorEventApplier,
    private readonly notifier: FloorEventNotifier,
  ) {}

  hasActiveChoices() {
    return this.activeChoices !== null
  }

  getActiveChoices() {
    return this.activeChoices
  }

  offer(tile: FloorEventTile) {
    const choices = this.floorEventRole.createChoices(tile.kind)
    this.activeTile = tile
    this.activeChoices = choices
    this.notifier.setFloorEventChoices(choices)
    this.notifier.pushLog(`${tile.kind.toUpperCase()} event: choose your option.`)
  }

  choose(run: RunState, choiceId: string): FloorEventResolution | null {
    if (!this.activeTile || !this.activeChoices || run.gameOver) {
      return null
    }

    const log = this.floorEventRole.applyChoice(run, this.activeTile.kind, choiceId)
    if (!log) {
      return null
    }

    run.floorData.events = run.floorData.events.filter(
      (tile) => tile.id !== this.activeTile?.id,
    )

    const consumedPos = this.activeTile.pos
    this.clear()
    this.notifier.pushLog(log)

    return {
      consumedPos,
      log,
      resultedInDeath: run.hp <= 0,
    }
  }

  clear() {
    this.activeTile = null
    this.activeChoices = null
    this.notifier.clearFloorEventChoices()
  }
}

import type { HeroClassId, RunState } from './model'
import type { HeroRoleService, LevelUpChoice } from './hero'
import type { RunNotifier } from './runNotifier'

type HeroLevelingService = Pick<
  HeroRoleService,
  'gainPendingLevelUps' | 'createLevelUpChoices' | 'applyLevelUpChoice'
>
type LevelUpNotifier = Pick<
  RunNotifier,
  'setLevelUpChoices' | 'clearLevelUpChoices' | 'pushLog'
>

export class LevelUpFlow {
  private pendingLevelUps = 0
  private activeChoices: LevelUpChoice[] | null = null

  constructor(
    private readonly heroRole: HeroLevelingService,
    private readonly notifier: LevelUpNotifier,
    private readonly playLevelUpAudio: () => void,
  ) {}

  reset() {
    this.pendingLevelUps = 0
    this.activeChoices = null
    this.notifier.clearLevelUpChoices()
  }

  hasActiveChoices() {
    return this.activeChoices !== null
  }

  getActiveChoices() {
    return this.activeChoices
  }

  choose(run: RunState, choiceId: string, heroClass: HeroClassId) {
    if (!this.activeChoices || run.gameOver) {
      return null
    }

    const log = this.heroRole.applyLevelUpChoice(run, choiceId, heroClass)
    if (!log) {
      return null
    }

    this.notifier.pushLog(log)
    this.pendingLevelUps = Math.max(0, this.pendingLevelUps - 1)
    this.playLevelUpAudio()

    if (this.pendingLevelUps > 0) {
      this.offerChoices(heroClass)
    } else {
      this.activeChoices = null
      this.notifier.clearLevelUpChoices()
    }

    return log
  }

  collectPending(run: RunState) {
    const gained = this.heroRole.gainPendingLevelUps(run)
    if (gained <= 0) {
      return false
    }

    this.pendingLevelUps += gained
    this.offerChoices(run.heroClass)
    return true
  }

  clearActiveChoices() {
    this.activeChoices = null
    this.pendingLevelUps = 0
    this.notifier.clearLevelUpChoices()
  }

  private offerChoices(heroClass: HeroClassId) {
    const choices = this.heroRole.createLevelUpChoices(heroClass, 3)
    this.activeChoices = choices
    this.notifier.setLevelUpChoices(choices)
    this.notifier.pushLog('Level up! Choose one card.')
  }
}

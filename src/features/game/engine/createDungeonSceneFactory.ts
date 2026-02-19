import type { CreateRoguelikeGameOptions } from './contracts'
import { RetroSfx } from './audio'
import { DungeonVisualSystem } from './dungeonVisualSystem'
import { FloorEventService } from './floorEvent'
import { FloorEventFlow } from './floorEventFlow'
import { HeroRoleService } from './hero'
import { InputMapper } from './input'
import { LevelUpFlow } from './levelUpFlow'
import { SceneInputController } from './sceneInputController'
import { EnemyPhaseResolver } from './enemyPhaseResolver'
import { RunNotifier } from './runNotifier'
import { RunLifecycleService } from './runLifecycleService'
import { SceneEffects } from './sceneEffects'
import { TurnResolver } from './turnResolver'
import { LootService } from './lootService'
import {
  type HeroClassId,
  keyOf,
  randomInt,
  samePos,
  type RunState,
} from './model'
import { MonsterRoleService } from './monster'
import { MonsterTypeCatalog } from './monsterTypes'
import { TerrainRoleService } from './terrain'
import {
  ensureAnimations,
  ensureSpriteSheets,
} from './spriteSheet'

export function createDungeonSceneFactory(
  Phaser: typeof import('phaser'),
  callbacks: CreateRoguelikeGameOptions,
) {
  return class DungeonScene extends Phaser.Scene {
    private run: RunState
    private uiInputBlocked = false
    private readonly inputMapper = new InputMapper()
    private readonly heroRole = new HeroRoleService(randomInt)
    private readonly monsterRole = new MonsterRoleService(randomInt)
    private readonly monsterCatalog = new MonsterTypeCatalog()
    private readonly terrainRole = new TerrainRoleService()
    private readonly runLifecycle = new RunLifecycleService()
    private readonly notifier = new RunNotifier(callbacks)
    private readonly floorEventRole = new FloorEventService(randomInt)
    private readonly lootService = new LootService(randomInt)
    private readonly audio = new RetroSfx(
      () => (this.sound as unknown as { context?: AudioContext }).context,
    )
    private readonly levelUpFlow = new LevelUpFlow(
      this.heroRole,
      this.notifier,
      this.audio.play.bind(this.audio, 'levelUp'),
    )
    private readonly floorEventFlow = new FloorEventFlow(
      this.floorEventRole,
      this.notifier,
    )
    private readonly inputController = new SceneInputController(
      this.inputMapper,
      {
        getLevelUpChoices: () => this.levelUpFlow.getActiveChoices(),
        getFloorEventChoices: () => this.floorEventFlow.getActiveChoices(),
        isUiInputBlocked: () => this.uiInputBlocked,
        chooseLevelUpReward: (choiceId) => this.chooseLevelUpReward(choiceId),
        chooseFloorEventOption: (choiceId) => this.chooseFloorEventOption(choiceId),
        processTurn: (dx, dy) => this.processTurn(dx, dy),
      },
    )
    private readonly visuals = new DungeonVisualSystem(this)
    private readonly effects = new SceneEffects(this, Phaser)
    private readonly turnResolver = new TurnResolver(randomInt)
    private readonly enemyPhaseResolver = new EnemyPhaseResolver(
      this.monsterRole,
      this.monsterCatalog,
      this.visuals,
      Math.random,
    )
    private portalResonanceUsed = false

    constructor() {
      super('dungeon')
      this.run = this.runLifecycle.createNewRun(callbacks.initialHeroClass)
    }

    create() {
      this.heroRole.resetBuildSynergy()
      ensureSpriteSheets(this)
      ensureAnimations(this)
      this.visuals.drawBoard()
      this.visuals.createUiOverlay()
      this.bindInput()
      this.visuals.rebuildFloorObjects(this.run)
      this.portalResonanceUsed = false
      this.notifier.resetTransientUi()
      this.notifier.pushLog(
        `${this.run.heroClass} run started. Reach the portal to descend.`,
      )
      this.audio.play('runStart')
      this.pushState()
    }

    newRun(heroClass: HeroClassId) {
      this.heroRole.resetBuildSynergy()
      this.run = this.runLifecycle.createNewRun(heroClass)
      this.levelUpFlow.reset()
      this.floorEventFlow.clear()
      this.portalResonanceUsed = false
      this.notifier.resetTransientUi()
      this.visuals.rebuildFloorObjects(this.run)
      this.notifier.pushLog(`New ${heroClass} run started.`)
      this.audio.play('newRun')
      this.pushState()
    }

    chooseLevelUpReward(choiceId: string) {
      if (!this.levelUpFlow.hasActiveChoices() || this.floorEventFlow.hasActiveChoices()) {
        return
      }

      if (!this.levelUpFlow.choose(this.run, choiceId, this.run.heroClass)) {
        return
      }
      this.pushState()
    }

    chooseFloorEventOption(choiceId: string) {
      const result = this.floorEventFlow.choose(this.run, choiceId)
      if (!result) {
        return
      }

      this.visuals.consumeEventVisual(result.consumedPos)
      if (result.resultedInDeath) {
        this.triggerGameOver(`You fell during a floor event on floor ${this.run.floor}.`)
      }
      this.pushState()
    }

    setUiInputBlocked(blocked: boolean) {
      this.uiInputBlocked = blocked
    }

    setAudioMuted(muted: boolean) {
      this.audio.setMuted(muted)
    }

    setAudioVolume(volume: number) {
      this.audio.setMasterVolume(volume)
    }

    private bindInput() {
      this.input.keyboard?.on('keydown', (event: KeyboardEvent) => {
        this.inputController.handleKeyDown(event)
      })
    }

    private processTurn(dx: number, dy: number) {
      if (this.run.gameOver || this.levelUpFlow.hasActiveChoices()) return
      if (this.floorEventFlow.hasActiveChoices()) return

      const target = { x: this.run.player.x + dx, y: this.run.player.y + dy }
      const moving = dx !== 0 || dy !== 0

      if (moving) {
        if (
          target.x < 0 ||
          target.y < 0 ||
          target.x >= this.run.floorData.width ||
          target.y >= this.run.floorData.height
        ) {
          return
        }
        if (this.run.floorData.walls.has(keyOf(target))) {
          this.pushLog('Blocked by stone wall.')
          this.audio.play('wallBlocked')
          this.effects.cameraShake(90)
          return
        }

        const enemyCollision = this.turnResolver.resolveEnemyCollision({
          run: this.run,
          target,
          heroRole: this.heroRole,
          visuals: this.visuals,
          playOnceThen: this.effects.playOnceThen.bind(this.effects),
          playAudio: this.audio.play.bind(this.audio),
          pushLog: this.pushLog.bind(this),
          hitFlash: this.effects.hitFlash.bind(this.effects),
          cameraShake: this.effects.cameraShake.bind(this.effects),
        })
        if (!enemyCollision.handled) {
          this.run.player = target
          const isExit = samePos(target, this.run.floorData.exit)
          const eventIdx = this.run.floorData.events.findIndex((tile) =>
            samePos(tile.pos, target),
          )
          const tileEffects = this.turnResolver.resolveTileEffects({
            run: this.run,
            target,
            terrainRole: this.terrainRole,
            playAudio: this.audio.play.bind(this.audio),
            pushLog: this.pushLog.bind(this),
            triggerTrapFlash: this.effects.trapHitFlash.bind(this.effects),
            cameraShake: this.effects.cameraShake.bind(this.effects),
            visuals: this.visuals,
            applyTrapEffect: this.lootService.applyTrapEffect.bind(this.lootService),
            applyChestReward: this.lootService.applyChestReward.bind(this.lootService, this.run),
            portalResonanceUsed: this.portalResonanceUsed,
          })
          this.portalResonanceUsed = tileEffects.portalResonanceUsed
          if (tileEffects.diedByTrap) {
            this.triggerGameOver(`You were slain by a trap on floor ${this.run.floor}.`)
            this.pushState()
            return
          }
          if (eventIdx >= 0) {
            const tile = this.run.floorData.events[eventIdx]
            this.visuals.tweenPlayerTo(
              target,
              () => {
                this.visuals.updatePlayerHpBar(this.run)
                this.visuals.updateVision(this.run)
              },
              () => {
                this.floorEventFlow.offer(tile)
                this.pushState()
              },
            )
            return
          }

          if (isExit) {
            this.visuals.killPlayerTweens()
            this.runLifecycle.descendFloor(this.run)
            this.pushLog(`Descended to floor ${this.run.floor}.`)
            this.audio.play('descendFloor')
            this.portalResonanceUsed = false
            this.floorEventFlow.clear()
            this.visuals.rebuildFloorObjects(this.run)
            this.pushState()
            return
          }

          this.visuals.tweenPlayerTo(target, () => {
            this.visuals.updatePlayerHpBar(this.run)
            this.visuals.updateVision(this.run)
          })
        }
      } else {
        this.pushLog('You hold your stance.')
      }

      if (this.levelUpFlow.collectPending(this.run)) {
        this.pushState()
        return
      }

      this.enemyPhase()
      this.run.turn += 1
      this.pushState()
    }

    private enemyPhase() {
      this.enemyPhaseResolver.execute({
        run: this.run,
        playOnceThen: this.effects.playOnceThen.bind(this.effects),
        pushLog: this.pushLog.bind(this),
        playAudio: this.audio.play.bind(this.audio),
        hitFlash: this.effects.hitFlash.bind(this.effects),
        triggerGameOver: this.triggerGameOver.bind(this),
      })
    }

    private triggerGameOver(message: string) {
      if (!this.runLifecycle.markGameOver(this.run)) {
        return
      }
      this.pushLog(message)
      this.notifier.resetTransientUi()
      this.levelUpFlow.clearActiveChoices()
      this.floorEventFlow.clear()
      this.audio.play('death')
      this.effects.cameraShake(200)
    }

    private pushState() {
      this.visuals.updatePlayerHpBar(this.run)
      this.visuals.updateVision(this.run)
      this.notifier.pushState(this.run)
    }

    private pushLog(message: string) {
      this.notifier.pushLog(message)
    }

  }
}

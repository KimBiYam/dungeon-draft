import type { CreateRoguelikeGameOptions } from './contracts'
import { RetroSfx } from './audio'
import { DungeonVisualSystem } from './dungeonVisualSystem'
import { FloorEventService, type FloorEventChoice } from './floorEvent'
import { HeroRoleService, type LevelUpChoice } from './hero'
import { InputMapper } from './input'
import { EnemyPhaseResolver } from './enemyPhaseResolver'
import { RunLifecycleService } from './runLifecycleService'
import { TurnResolver } from './turnResolver'
import {
  type FloorEventTile,
  TILE,
  type HeroClassId,
  type TrapKind,
  clamp,
  keyOf,
  randomInt,
  samePos,
  toHud,
  type Pos,
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
    private pendingLevelUps = 0
    private activeLevelUpChoices: LevelUpChoice[] | null = null
    private activeFloorEventChoices: FloorEventChoice[] | null = null
    private activeFloorEventTile: FloorEventTile | null = null
    private readonly inputMapper = new InputMapper()
    private readonly heroRole = new HeroRoleService(randomInt)
    private readonly monsterRole = new MonsterRoleService(randomInt)
    private readonly monsterCatalog = new MonsterTypeCatalog()
    private readonly terrainRole = new TerrainRoleService()
    private readonly runLifecycle = new RunLifecycleService()
    private readonly floorEventRole = new FloorEventService(randomInt)
    private readonly visuals = new DungeonVisualSystem(this)
    private readonly turnResolver = new TurnResolver(randomInt)
    private readonly enemyPhaseResolver = new EnemyPhaseResolver(
      this.monsterRole,
      this.monsterCatalog,
      this.visuals,
      Math.random,
    )
    private readonly audio = new RetroSfx(
      () => (this.sound as unknown as { context?: AudioContext }).context,
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
      callbacks.onLevelUpChoices(null)
      callbacks.onFloorEventChoices(null)
      callbacks.onLog(
        `${this.run.heroClass} run started. Reach the portal to descend.`,
      )
      this.audio.play('runStart')
      this.pushState()
    }

    newRun(heroClass: HeroClassId) {
      this.heroRole.resetBuildSynergy()
      this.run = this.runLifecycle.createNewRun(heroClass)
      this.pendingLevelUps = 0
      this.activeLevelUpChoices = null
      this.activeFloorEventChoices = null
      this.activeFloorEventTile = null
      this.portalResonanceUsed = false
      callbacks.onLevelUpChoices(null)
      callbacks.onFloorEventChoices(null)
      this.visuals.rebuildFloorObjects(this.run)
      callbacks.onLog(`New ${heroClass} run started.`)
      this.audio.play('newRun')
      this.pushState()
    }

    chooseLevelUpReward(choiceId: string) {
      if (!this.activeLevelUpChoices || this.run.gameOver || this.activeFloorEventChoices) {
        return
      }

      const log = this.heroRole.applyLevelUpChoice(
        this.run,
        choiceId,
        this.run.heroClass,
      )
      if (!log) {
        return
      }

      this.pushLog(log)
      this.pendingLevelUps = Math.max(0, this.pendingLevelUps - 1)
      this.audio.play('levelUp')

      if (this.pendingLevelUps > 0) {
        this.offerLevelUpChoices()
      } else {
        this.activeLevelUpChoices = null
        callbacks.onLevelUpChoices(null)
      }

      this.pushState()
    }

    chooseFloorEventOption(choiceId: string) {
      if (!this.activeFloorEventTile || !this.activeFloorEventChoices || this.run.gameOver) {
        return
      }

      const log = this.floorEventRole.applyChoice(
        this.run,
        this.activeFloorEventTile.kind,
        choiceId,
      )
      if (!log) {
        return
      }

      this.run.floorData.events = this.run.floorData.events.filter(
        (tile) => tile.id !== this.activeFloorEventTile?.id,
      )
      this.visuals.consumeEventVisual(this.activeFloorEventTile.pos)
      this.activeFloorEventTile = null
      this.activeFloorEventChoices = null
      callbacks.onFloorEventChoices(null)
      this.pushLog(log)
      if (this.run.hp <= 0) {
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
        if (event.repeat) return

        const levelUpChoiceIndex = this.inputMapper.resolveLevelUpChoiceIndex(
          event.key,
          event.code,
        )
        if (this.activeLevelUpChoices && levelUpChoiceIndex !== null) {
          event.preventDefault()
          const choice = this.activeLevelUpChoices[levelUpChoiceIndex]
          if (choice) this.chooseLevelUpReward(choice.id)
          return
        }
        if (this.activeFloorEventChoices && levelUpChoiceIndex !== null) {
          event.preventDefault()
          const choice = this.activeFloorEventChoices[levelUpChoiceIndex]
          if (choice) this.chooseFloorEventOption(choice.id)
          return
        }

        const command = this.inputMapper.resolveCommand(event.key)
        if (!command) return

        event.preventDefault()
        if (this.uiInputBlocked || this.activeLevelUpChoices || this.activeFloorEventChoices) return
        this.processTurn(command.move.x, command.move.y)
      })
    }

    private offerLevelUpChoices() {
      const choices = this.heroRole.createLevelUpChoices(this.run.heroClass, 3)
      this.activeLevelUpChoices = choices
      callbacks.onLevelUpChoices(choices)
      this.pushLog('Level up! Choose one card.')
    }

    private offerFloorEventChoices(tile: FloorEventTile) {
      const choices = this.floorEventRole.createChoices(tile.kind)
      this.activeFloorEventTile = tile
      this.activeFloorEventChoices = choices
      callbacks.onFloorEventChoices(choices)
      this.pushLog(`${tile.kind.toUpperCase()} event: choose your option.`)
    }

    private processPendingLevelUps() {
      const gained = this.heroRole.gainPendingLevelUps(this.run)
      if (gained <= 0) {
        return false
      }

      this.pendingLevelUps += gained
      this.offerLevelUpChoices()
      return true
    }

    private processTurn(dx: number, dy: number) {
      if (this.run.gameOver || this.activeLevelUpChoices) return
      if (this.activeFloorEventChoices) return

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
          this.cameraShake(90)
          return
        }

        const enemyCollision = this.turnResolver.resolveEnemyCollision({
          run: this.run,
          target,
          heroRole: this.heroRole,
          visuals: this.visuals,
          playOnceThen: this.playOnceThen.bind(this),
          playAudio: this.audio.play.bind(this.audio),
          pushLog: this.pushLog.bind(this),
          hitFlash: this.hitFlash.bind(this),
          cameraShake: this.cameraShake.bind(this),
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
            triggerTrapFlash: this.trapHitFlash.bind(this),
            cameraShake: this.cameraShake.bind(this),
            visuals: this.visuals,
            applyTrapEffect: this.applyTrapEffect.bind(this),
            applyChestReward: this.applyChestReward.bind(this),
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
                this.offerFloorEventChoices(tile)
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
            this.activeFloorEventChoices = null
            this.activeFloorEventTile = null
            callbacks.onFloorEventChoices(null)
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

      if (this.processPendingLevelUps()) {
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
        playOnceThen: this.playOnceThen.bind(this),
        pushLog: this.pushLog.bind(this),
        playAudio: this.audio.play.bind(this.audio),
        hitFlash: this.hitFlash.bind(this),
        triggerGameOver: this.triggerGameOver.bind(this),
      })
    }

    private playOnceThen(
      sprite: Phaser.GameObjects.Sprite | undefined,
      anim: string,
      fallback: string,
    ) {
      if (!sprite) return
      sprite.play(anim, true)
      sprite.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
        if (sprite.active) sprite.play(fallback, true)
      })
    }

    private cameraShake(duration: number) {
      this.cameras.main.shake(duration, 0.004)
    }

    private trapHitFlash() {
      this.cameras.main.flash(140, 220, 38, 38, true)
    }

    private hitFlash(pos: Pos, color: number) {
      const flash = this.add.circle(
        pos.x * TILE + TILE / 2,
        pos.y * TILE + TILE / 2,
        16,
        color,
        0.6,
      )
      this.tweens.add({
        targets: flash,
        alpha: 0,
        duration: 180,
        onComplete: () => flash.destroy(),
      })
    }

    private applyTrapEffect(kind: TrapKind) {
      if (kind === 'spike') return randomInt(4, 8)
      if (kind === 'flame') return randomInt(6, 10)
      return randomInt(3, 7)
    }

    private applyChestReward(rarity: 'common' | 'rare') {
      if (rarity === 'rare') {
        if (randomInt(0, 1) === 0) {
          this.run.atk += 2
          return 'Rare chest! ATK +2.'
        }
        this.run.def += 2
        return 'Rare chest! DEF +2.'
      }

      if (this.run.hp < this.run.maxHp && randomInt(0, 1) === 0) {
        const heal = randomInt(5, 10)
        this.run.hp = clamp(this.run.hp + heal, 0, this.run.maxHp)
        return `Chest loot! +${heal} HP.`
      }

      const xp = randomInt(6, 12)
      this.run.xp += xp
      return `Chest loot! +${xp} XP.`
    }

    private triggerGameOver(message: string) {
      if (!this.runLifecycle.markGameOver(this.run)) {
        return
      }
      this.pushLog(message)
      callbacks.onLevelUpChoices(null)
      callbacks.onFloorEventChoices(null)
      this.activeLevelUpChoices = null
      this.activeFloorEventChoices = null
      this.activeFloorEventTile = null
      this.pendingLevelUps = 0
      this.audio.play('death')
      this.cameraShake(200)
    }

    private pushState() {
      this.visuals.updatePlayerHpBar(this.run)
      this.visuals.updateVision(this.run)
      callbacks.onState(toHud(this.run))
    }

    private pushLog(message: string) {
      callbacks.onLog(message)
    }

  }
}

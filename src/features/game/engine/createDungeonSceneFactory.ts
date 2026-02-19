import type { CreateRoguelikeGameOptions } from './contracts'
import { RetroSfx } from './audio'
import { DungeonVisualSystem } from './dungeonVisualSystem'
import { FloorEventService, type FloorEventChoice } from './floorEvent'
import { HeroRoleService, type LevelUpChoice } from './hero'
import { InputMapper } from './input'
import { EnemyPhaseResolver } from './enemyPhaseResolver'
import {
  type FloorEventTile,
  START_POS,
  TILE,
  type HeroClassId,
  type TrapKind,
  clamp,
  createFloor,
  createInitialRun,
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
  getHeroAttackAnimKey,
  getHeroIdleAnimKey,
  getMonsterHurtAnimKey,
  getMonsterIdleAnimKey,
} from './spriteSheet'

export function createDungeonSceneFactory(
  Phaser: typeof import('phaser'),
  callbacks: CreateRoguelikeGameOptions,
) {
  return class DungeonScene extends Phaser.Scene {
    private run: RunState = createInitialRun(callbacks.initialHeroClass)
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
    private readonly floorEventRole = new FloorEventService(randomInt)
    private readonly visuals = new DungeonVisualSystem(this)
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
      this.run = createInitialRun(heroClass)
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

        const enemy = this.run.floorData.enemies.find((e) => samePos(e.pos, target))
        if (enemy) {
          const dmg = this.heroRole.calculateAttackDamage(this.run.atk)
          this.playOnceThen(
            this.visuals.getPlayerSprite(),
            getHeroAttackAnimKey(this.run.heroClass),
            getHeroIdleAnimKey(this.run.heroClass),
          )
          this.audio.play('heroAttack')
          enemy.hp -= dmg
          this.pushLog(`You slash for ${dmg}.`)
          this.hitFlash(target, 0xfb7185)
          this.playOnceThen(
            this.visuals.getEnemySprite(enemy.id),
            getMonsterHurtAnimKey(enemy.monsterTypeId),
            getMonsterIdleAnimKey(enemy.monsterTypeId),
          )
          if (enemy.hp <= 0) {
            this.run.floorData.enemies = this.run.floorData.enemies.filter(
              (e) => e.id !== enemy.id,
            )
            const xp = randomInt(5, 8) + this.run.floor
            this.run.xp += xp
            this.pushLog(`${enemy.monsterName} down. +${xp} XP.`)
            this.audio.play('enemyDefeat')
            this.cameraShake(120)
            this.visuals.destroyEnemyVisual(enemy.id)
          } else {
            this.audio.play('enemyHit')
            this.visuals.updateEnemyHpBar(this.run, enemy.id)
          }
        } else {
          this.run.player = target
          const isExit = samePos(target, this.run.floorData.exit)
          const potionIdx = this.run.floorData.potions.findIndex((p) => samePos(p, target))
          const trapIdx = this.run.floorData.traps.findIndex((t) => samePos(t.pos, target))
          const chestIdx = this.run.floorData.chests.findIndex((c) => samePos(c.pos, target))
          const eventIdx = this.run.floorData.events.findIndex((tile) =>
            samePos(tile.pos, target),
          )
          if (potionIdx >= 0) {
            this.run.floorData.potions.splice(potionIdx, 1)
            const heal = randomInt(7, 12)
            this.run.hp = clamp(this.run.hp + heal, 0, this.run.maxHp)
            this.pushLog(`Potion! +${heal} HP.`)
            this.audio.play('pickupPotion')
            this.visuals.consumePotionVisual(target)
          }
          if (trapIdx >= 0) {
            const trap = this.run.floorData.traps.splice(trapIdx, 1)[0]
            const damage = this.applyTrapEffect(trap.kind)
            this.visuals.consumeTrapVisual(target)
            this.run.hp = clamp(this.run.hp - damage, 0, this.run.maxHp)
            this.pushLog(`${this.describeTrap(trap.kind)} trap! -${damage} HP.`)
            this.audio.play('trapTrigger')
            this.trapHitFlash()
            this.cameraShake(110)
            if (this.run.hp <= 0) {
              this.triggerGameOver(`You were slain by a trap on floor ${this.run.floor}.`)
              this.pushState()
              return
            }
          }

          if (
            !isExit &&
            !this.portalResonanceUsed &&
            this.terrainRole.isPortalResonanceTile(target, this.run.floorData.exit)
          ) {
            const heal = this.terrainRole.applyPortalResonance(this.run)
            this.portalResonanceUsed = true
            this.pushLog(`Portal resonance restores ${heal} HP.`)
            this.audio.play('pickupPotion')
          }
          if (chestIdx >= 0) {
            const chest = this.run.floorData.chests.splice(chestIdx, 1)[0]
            this.visuals.consumeChestVisual(target)
            const rewardLog = this.applyChestReward(chest.rarity)
            this.pushLog(rewardLog)
            this.audio.play('chestOpen')
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
            this.run.floor += 1
            this.run.player = { ...START_POS }
            this.run.floorData = createFloor(this.run.floor)
            this.run.hp = clamp(this.run.hp + 6, 0, this.run.maxHp)
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

    private describeTrap(kind: TrapKind) {
      if (kind === 'spike') return 'Spike'
      if (kind === 'flame') return 'Flame'
      return 'Venom'
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
      if (this.run.gameOver) {
        return
      }
      this.run.hp = 0
      this.run.gameOver = true
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

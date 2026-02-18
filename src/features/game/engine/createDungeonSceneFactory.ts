import type { CreateRoguelikeGameOptions } from './contracts'
import { RetroSfx } from './audio'
import { DungeonVisualSystem } from './dungeonVisualSystem'
import { HeroRoleService, type LevelUpChoice } from './hero'
import { InputMapper } from './input'
import {
  START_POS,
  TILE,
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
import {
  HERO_ATTACK_ANIM,
  HERO_HURT_ANIM,
  HERO_IDLE_ANIM,
  ensureAnimations,
  ensureSpriteSheets,
  getMonsterAttackAnimKey,
  getMonsterHurtAnimKey,
  getMonsterIdleAnimKey,
} from './spriteSheet'

export function createDungeonSceneFactory(
  Phaser: typeof import('phaser'),
  callbacks: CreateRoguelikeGameOptions,
) {
  return class DungeonScene extends Phaser.Scene {
    private run: RunState = createInitialRun()
    private uiInputBlocked = false
    private pendingLevelUps = 0
    private activeLevelUpChoices: LevelUpChoice[] | null = null
    private readonly inputMapper = new InputMapper()
    private readonly heroRole = new HeroRoleService(randomInt)
    private readonly monsterRole = new MonsterRoleService(randomInt)
    private readonly visuals = new DungeonVisualSystem(this)
    private readonly audio = new RetroSfx(
      () => (this.sound as unknown as { context?: AudioContext }).context,
    )

    constructor() {
      super('dungeon')
    }

    create() {
      ensureSpriteSheets(this)
      ensureAnimations(this)
      this.visuals.drawBoard()
      this.visuals.createUiOverlay()
      this.bindInput()
      this.visuals.rebuildFloorObjects(this.run)
      callbacks.onLevelUpChoices(null)
      callbacks.onLog('Run started. Reach the portal to descend.')
      this.audio.play('runStart')
      this.pushState()
    }

    newRun() {
      this.run = createInitialRun()
      this.pendingLevelUps = 0
      this.activeLevelUpChoices = null
      callbacks.onLevelUpChoices(null)
      this.visuals.rebuildFloorObjects(this.run)
      callbacks.onLog('New run started.')
      this.audio.play('newRun')
      this.pushState()
    }

    chooseLevelUpReward(choiceId: string) {
      if (!this.activeLevelUpChoices || this.run.gameOver) {
        return
      }

      const log = this.heroRole.applyLevelUpChoice(this.run, choiceId)
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

        const command = this.inputMapper.resolveCommand(event.key)
        if (!command) return

        event.preventDefault()
        if (this.uiInputBlocked || this.activeLevelUpChoices) return
        this.processTurn(command.move.x, command.move.y)
      })
    }

    private offerLevelUpChoices() {
      const choices = this.heroRole.createLevelUpChoices(3)
      this.activeLevelUpChoices = choices
      callbacks.onLevelUpChoices(choices)
      this.pushLog('Level up! Choose one card.')
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
          this.playOnceThen(this.visuals.getPlayerSprite(), HERO_ATTACK_ANIM, HERO_IDLE_ANIM)
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
          if (potionIdx >= 0) {
            this.run.floorData.potions.splice(potionIdx, 1)
            const heal = randomInt(7, 12)
            this.run.hp = clamp(this.run.hp + heal, 0, this.run.maxHp)
            this.pushLog(`Potion! +${heal} HP.`)
            this.audio.play('pickupPotion')
            this.visuals.consumePotionVisual(target)
          }

          if (isExit) {
            this.visuals.killPlayerTweens()
            this.run.floor += 1
            this.run.player = { ...START_POS }
            this.run.floorData = createFloor(this.run.floor)
            this.run.hp = clamp(this.run.hp + 6, 0, this.run.maxHp)
            this.pushLog(`Descended to floor ${this.run.floor}.`)
            this.audio.play('descendFloor')
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
      const occupied = new Set<string>(this.run.floorData.enemies.map((e) => keyOf(e.pos)))

      for (const enemy of this.run.floorData.enemies) {
        const distance =
          Math.abs(enemy.pos.x - this.run.player.x) +
          Math.abs(enemy.pos.y - this.run.player.y)

        if (distance === 1) {
          this.playOnceThen(
            this.visuals.getEnemySprite(enemy.id),
            getMonsterAttackAnimKey(enemy.monsterTypeId),
            getMonsterIdleAnimKey(enemy.monsterTypeId),
          )
          const dmg = this.monsterRole.calculateAttackDamage(enemy.atk, this.run.def)
          this.run.hp -= dmg
          this.pushLog(`${enemy.monsterName} hits for ${dmg}.`)
          this.audio.play('heroHit')
          this.hitFlash(this.run.player, 0x38bdf8)
          this.playOnceThen(this.visuals.getPlayerSprite(), HERO_HURT_ANIM, HERO_IDLE_ANIM)
          if (this.run.hp <= 0) {
            this.run.hp = 0
            this.run.gameOver = true
            this.pushLog(`You died on floor ${this.run.floor}. Press New Run.`)
            callbacks.onLevelUpChoices(null)
            this.activeLevelUpChoices = null
            this.pendingLevelUps = 0
            this.audio.play('death')
            this.cameraShake(200)
            return
          }
          continue
        }

        if (Math.random() < 0.3) continue

        const step = this.monsterRole.getChaseStep(enemy.pos, this.run.player)
        const candidate = { x: enemy.pos.x + step.x, y: enemy.pos.y + step.y }
        const key = keyOf(candidate)
        const blocked =
          this.run.floorData.walls.has(key) ||
          occupied.has(key) ||
          samePos(candidate, this.run.player) ||
          samePos(candidate, this.run.floorData.exit)

        if (!blocked) {
          const from = { ...enemy.pos }
          occupied.delete(keyOf(enemy.pos))
          enemy.pos = candidate
          occupied.add(key)
          this.visuals.moveEnemyVisual(enemy.id, from, candidate)
        }
      }
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

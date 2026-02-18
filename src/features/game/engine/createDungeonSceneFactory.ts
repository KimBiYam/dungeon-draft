import type { CreateRoguelikeGameOptions } from './contracts'
import { GOLD_HEAL_AMOUNT, GOLD_HEAL_COST } from './contracts'
import { getArmorUpgradeCost, getWeaponUpgradeCost } from './economy'
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
import { HeroRoleService } from './hero'
import { InputMapper } from './input'
import { MonsterRoleService } from './monster'
import { DungeonVisualSystem } from './dungeonVisualSystem'
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
    private readonly inputMapper = new InputMapper()
    private readonly heroRole = new HeroRoleService(randomInt)
    private readonly monsterRole = new MonsterRoleService(randomInt)
    private readonly visuals = new DungeonVisualSystem(this)

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
      callbacks.onLog('Run started. Reach the portal to descend.')
      this.pushState()
    }

    newRun() {
      this.run = createInitialRun()
      this.visuals.rebuildFloorObjects(this.run)
      callbacks.onLog('New run started.')
      this.pushState()
    }

    setUiInputBlocked(blocked: boolean) {
      this.uiInputBlocked = blocked
    }

    spendGoldForHeal() {
      if (this.run.gameOver) {
        this.pushLog('Cannot heal after death. Start a new run.')
        return
      }
      if (this.run.gold < GOLD_HEAL_COST) {
        this.pushLog(`Need ${GOLD_HEAL_COST} gold to mend.`)
        return
      }
      if (this.run.hp >= this.run.maxHp) {
        this.pushLog('HP is already full.')
        return
      }

      this.run.gold -= GOLD_HEAL_COST
      const healed = Math.min(GOLD_HEAL_AMOUNT, this.run.maxHp - this.run.hp)
      this.run.hp += healed
      this.pushLog(`Mended wounds for ${healed} HP (-${GOLD_HEAL_COST} gold).`)
      this.pushState()
    }

    spendGoldForWeaponUpgrade() {
      if (this.run.gameOver) {
        this.pushLog('Cannot forge weapons after death. Start a new run.')
        return
      }
      const cost = getWeaponUpgradeCost(this.run.weaponLevel)
      if (this.run.gold < cost) {
        this.pushLog(`Need ${cost} gold to upgrade weapon.`)
        return
      }

      this.run.gold -= cost
      this.run.weaponLevel += 1
      this.run.atk += 1
      this.pushLog(`Weapon upgraded to +${this.run.weaponLevel - 1} ATK (-${cost} gold).`)
      this.pushState()
    }

    spendGoldForArmorUpgrade() {
      if (this.run.gameOver) {
        this.pushLog('Cannot reinforce armor after death. Start a new run.')
        return
      }
      const cost = getArmorUpgradeCost(this.run.armorLevel)
      if (this.run.gold < cost) {
        this.pushLog(`Need ${cost} gold to upgrade armor.`)
        return
      }

      this.run.gold -= cost
      this.run.armorLevel += 1
      this.run.def += 1
      this.pushLog(`Armor upgraded to +${this.run.armorLevel - 1} DEF (-${cost} gold).`)
      this.pushState()
    }

    private bindInput() {
      this.input.keyboard?.on('keydown', (event: KeyboardEvent) => {
        if (event.repeat) return

        const command = this.inputMapper.resolveCommand(event.key, event.code)
        if (!command) return

        event.preventDefault()
        if (this.uiInputBlocked) return

        if (command.type === 'upgradeWeapon') {
          this.spendGoldForWeaponUpgrade()
          return
        }
        if (command.type === 'upgradeArmor') {
          this.spendGoldForArmorUpgrade()
          return
        }
        this.processTurn(command.move.x, command.move.y)
      })
    }

    private processTurn(dx: number, dy: number) {
      if (this.run.gameOver) return

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
          this.cameraShake(90)
          return
        }

        const enemy = this.run.floorData.enemies.find((e) => samePos(e.pos, target))
        if (enemy) {
          const dmg = this.heroRole.calculateAttackDamage(this.run.atk)
          this.playOnceThen(this.visuals.getPlayerSprite(), HERO_ATTACK_ANIM, HERO_IDLE_ANIM)
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
            const gold = randomInt(3, 9)
            this.run.xp += xp
            this.run.gold += gold
            this.pushLog(`${enemy.monsterName} down. +${xp} XP, +${gold} gold.`)
            this.cameraShake(120)
            this.visuals.destroyEnemyVisual(enemy.id)
          } else {
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
            this.visuals.consumePotionVisual(target)
          }

          const goldIdx = this.run.floorData.goldPiles.findIndex((g) => samePos(g, target))
          if (goldIdx >= 0) {
            this.run.floorData.goldPiles.splice(goldIdx, 1)
            const loot = randomInt(6, 13)
            this.run.gold += loot
            this.pushLog(`Looted ${loot} gold.`)
            this.visuals.consumeGoldVisual(target)
          }

          if (isExit) {
            this.visuals.killPlayerTweens()
            this.run.floor += 1
            this.run.player = { ...START_POS }
            this.run.floorData = createFloor(this.run.floor)
            this.run.hp = clamp(this.run.hp + 6, 0, this.run.maxHp)
            this.pushLog(`Descended to floor ${this.run.floor}.`)
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

      for (const levelUpLog of this.heroRole.applyLevelUps(this.run)) {
        this.pushLog(levelUpLog)
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
          this.hitFlash(this.run.player, 0x38bdf8)
          this.playOnceThen(this.visuals.getPlayerSprite(), HERO_HURT_ANIM, HERO_IDLE_ANIM)
          if (this.run.hp <= 0) {
            this.run.hp = 0
            this.run.gameOver = true
            this.pushLog(`You died on floor ${this.run.floor}. Press New Run.`)
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

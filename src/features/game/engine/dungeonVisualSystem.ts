import type Phaser from 'phaser'

import {
  MAX_MAP_H,
  MAX_MAP_W,
  clamp,
  keyOf,
  TILE,
  type Pos,
  type RunState,
} from './model'
import {
  HERO_FRAME_0,
  HERO_IDLE_ANIM,
  HERO_WALK_ANIM,
  getMonsterFrame0Key,
  getMonsterIdleAnimKey,
} from './spriteSheet'

type EnemyVisual = {
  shadow: Phaser.GameObjects.Ellipse
  sprite: Phaser.GameObjects.Sprite
  hpBg: Phaser.GameObjects.Rectangle
  hpFill: Phaser.GameObjects.Rectangle
}

export class DungeonVisualSystem {
  private static readonly VISION_RADIUS = 3
  private playerSprite?: Phaser.GameObjects.Sprite
  private playerHpBg?: Phaser.GameObjects.Rectangle
  private playerHpFill?: Phaser.GameObjects.Rectangle
  private uiHpBg?: Phaser.GameObjects.Rectangle
  private uiHpFill?: Phaser.GameObjects.Rectangle
  private uiHpText?: Phaser.GameObjects.Text
  private wallGroup?: Phaser.GameObjects.Group
  private enemyGroup?: Phaser.GameObjects.Group
  private potionGroup?: Phaser.GameObjects.Group
  private exitOrb?: Phaser.GameObjects.Arc
  private enemyVisuals = new Map<string, EnemyVisual>()
  private potionVisuals = new Map<string, Phaser.GameObjects.Arc>()
  private fogTiles = new Map<string, Phaser.GameObjects.Rectangle>()

  constructor(private readonly scene: Phaser.Scene) {}

  drawBoard() {
    this.scene.cameras.main.setBackgroundColor('#0a0a0b')
    const g = this.scene.add.graphics()
    for (let y = 0; y < MAX_MAP_H; y++) {
      for (let x = 0; x < MAX_MAP_W; x++) {
        const tint = (x + y) % 2 === 0 ? 0x101114 : 0x0b0c0f
        g.fillStyle(tint, 1)
        g.fillRect(x * TILE, y * TILE, TILE, TILE)
      }
    }
  }

  createUiOverlay() {
    this.uiHpBg = this.scene.add
      .rectangle(86, 20, 128, 12, 0x111827, 0.95)
      .setOrigin(0, 0.5)
    this.uiHpBg.setStrokeStyle(1, 0x52525b, 0.9)
    this.uiHpBg.setDepth(40)

    this.uiHpFill = this.scene.add
      .rectangle(86, 20, 128, 12, 0x22c55e, 0.95)
      .setOrigin(0, 0.5)
    this.uiHpFill.setDepth(41)

    this.uiHpText = this.scene.add.text(16, 12, '', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#e5e7eb',
    })
    this.uiHpText.setDepth(42)
  }

  rebuildFloorObjects(run: RunState) {
    this.killPlayerTweens()

    this.wallGroup?.clear(true, true)
    this.enemyGroup?.clear(true, true)
    this.potionGroup?.clear(true, true)
    if (this.exitOrb) {
      this.scene.tweens.killTweensOf(this.exitOrb)
      this.exitOrb.destroy()
      this.exitOrb = undefined
    }
    this.enemyVisuals.clear()
    this.potionVisuals.clear()
    this.fogTiles.forEach((tile) => tile.destroy())
    this.fogTiles.clear()

    this.wallGroup = this.scene.add.group()
    this.enemyGroup = this.scene.add.group()
    this.potionGroup = this.scene.add.group()

    for (let y = 0; y < run.floorData.height; y++) {
      for (let x = 0; x < run.floorData.width; x++) {
        if (run.floorData.walls.has(keyOf({ x, y }))) {
          const wall = this.scene.add.rectangle(
            x * TILE + TILE / 2,
            y * TILE + TILE / 2,
            TILE - 4,
            TILE - 4,
            0x3f3f46,
          )
          wall.setStrokeStyle(2, 0x71717a, 0.8)
          this.wallGroup.add(wall)
        }
      }
    }

    for (const pos of run.floorData.potions) {
      const potion = this.scene.add.circle(
        pos.x * TILE + TILE / 2,
        pos.y * TILE + TILE / 2,
        10,
        0x22c55e,
        0.95,
      )
      this.potionGroup.add(potion)
      this.potionVisuals.set(keyOf(pos), potion)
    }

    const exitOrb = this.scene.add.circle(
      run.floorData.exit.x * TILE + TILE / 2,
      run.floorData.exit.y * TILE + TILE / 2,
      12,
      0x8b5cf6,
      0.9,
    )
    this.exitOrb = exitOrb

    for (const enemy of run.floorData.enemies) {
      const shadow = this.scene.add.ellipse(
        enemy.pos.x * TILE + TILE / 2,
        enemy.pos.y * TILE + TILE / 2 + 12,
        24,
        9,
        0x000000,
        0.35,
      )
      this.enemyGroup.add(shadow)

      const sprite = this.scene.add.sprite(
        enemy.pos.x * TILE + TILE / 2,
        enemy.pos.y * TILE + TILE / 2,
        getMonsterFrame0Key(enemy.monsterTypeId),
      )
      sprite.setDisplaySize(30, 30)
      sprite.play(getMonsterIdleAnimKey(enemy.monsterTypeId))
      this.enemyGroup.add(sprite)

      const ratio = clamp(enemy.hp / enemy.maxHp, 0.08, 1)
      const hpBg = this.scene.add.rectangle(
        enemy.pos.x * TILE + TILE / 2,
        enemy.pos.y * TILE + TILE / 2 - 19,
        28,
        5,
        0x09090b,
        0.95,
      )
      hpBg.setStrokeStyle(1, 0x52525b, 0.9)
      const hpFill = this.scene.add.rectangle(
        enemy.pos.x * TILE + TILE / 2 - 14,
        enemy.pos.y * TILE + TILE / 2 - 19,
        28 * ratio,
        5,
        0xfb7185,
        0.95,
      )
      hpFill.setOrigin(0, 0.5)
      this.enemyGroup.add(hpBg)
      this.enemyGroup.add(hpFill)

      this.enemyVisuals.set(enemy.id, { shadow, sprite, hpBg, hpFill })
    }

    if (!this.playerSprite) {
      this.playerSprite = this.scene.add.sprite(
        run.player.x * TILE + TILE / 2,
        run.player.y * TILE + TILE / 2,
        HERO_FRAME_0,
      )
      this.playerSprite.setDisplaySize(30, 30)
      this.playerSprite.play(HERO_IDLE_ANIM)
    } else {
      this.playerSprite.setPosition(
        run.player.x * TILE + TILE / 2,
        run.player.y * TILE + TILE / 2,
      )
    }

    this.createFogLayer()
    this.updatePlayerHpBar(run)
    this.updateVision(run)
  }

  consumePotionVisual(pos: Pos) {
    const key = keyOf(pos)
    const visual = this.potionVisuals.get(key)
    if (!visual) return
    this.scene.tweens.killTweensOf(visual)
    visual.destroy()
    this.potionVisuals.delete(key)
  }

  tweenPlayerTo(pos: Pos, onUpdate: () => void) {
    if (!this.playerSprite) return
    this.scene.tweens.add({
      targets: this.playerSprite,
      x: pos.x * TILE + TILE / 2,
      y: pos.y * TILE + TILE / 2,
      duration: 110,
      ease: 'Quad.Out',
      onStart: () => this.playerSprite?.play(HERO_WALK_ANIM, true),
      onComplete: () => this.playerSprite?.play(HERO_IDLE_ANIM, true),
      onUpdate,
    })
  }

  moveEnemyVisual(id: string, from: Pos, to: Pos) {
    const visual = this.enemyVisuals.get(id)
    if (!visual) return
    this.scene.tweens.killTweensOf(visual.shadow)
    this.scene.tweens.killTweensOf(visual.sprite)
    this.scene.tweens.killTweensOf(visual.hpBg)
    this.scene.tweens.killTweensOf(visual.hpFill)

    const fromX = from.x * TILE + TILE / 2
    const fromY = from.y * TILE + TILE / 2
    const toX = to.x * TILE + TILE / 2
    const toY = to.y * TILE + TILE / 2

    visual.shadow.setPosition(fromX, fromY + 12)
    visual.sprite.setPosition(fromX, fromY)
    visual.hpBg.setPosition(fromX, fromY - 19)
    visual.hpFill.setPosition(fromX - 14, fromY - 19)

    this.scene.tweens.add({
      targets: visual.shadow,
      x: toX,
      y: toY + 12,
      duration: 100,
      ease: 'Quad.Out',
    })
    this.scene.tweens.add({
      targets: visual.sprite,
      x: toX,
      y: toY,
      duration: 100,
      ease: 'Quad.Out',
    })
    this.scene.tweens.add({
      targets: visual.hpBg,
      x: toX,
      y: toY - 19,
      duration: 100,
      ease: 'Quad.Out',
    })
    this.scene.tweens.add({
      targets: visual.hpFill,
      x: toX - 14,
      y: toY - 19,
      duration: 100,
      ease: 'Quad.Out',
    })
  }

  destroyEnemyVisual(id: string) {
    const visual = this.enemyVisuals.get(id)
    if (!visual) return
    visual.shadow.destroy()
    visual.sprite.destroy()
    visual.hpBg.destroy()
    visual.hpFill.destroy()
    this.enemyVisuals.delete(id)
  }

  updateEnemyHpBar(run: RunState, id: string) {
    const enemy = run.floorData.enemies.find((item) => item.id === id)
    const visual = this.enemyVisuals.get(id)
    if (!enemy || !visual) return
    const ratio = clamp(enemy.hp / enemy.maxHp, 0.08, 1)
    visual.hpFill.setDisplaySize(28 * ratio, 5)
  }

  updatePlayerHpBar(run: RunState) {
    if (!this.playerSprite) return

    const ratio = clamp(run.hp / run.maxHp, 0, 1)
    const fullWidth = 30
    const barY = this.playerSprite.y - 20
    const barX = this.playerSprite.x - fullWidth / 2

    if (!this.playerHpBg) {
      this.playerHpBg = this.scene.add
        .rectangle(barX, barY, fullWidth, 5, 0x09090b, 0.95)
        .setOrigin(0, 0.5)
      this.playerHpBg.setStrokeStyle(1, 0x64748b, 0.9)
      this.playerHpBg.setDepth(22)
    } else {
      this.playerHpBg.setPosition(barX, barY)
    }

    if (!this.playerHpFill) {
      this.playerHpFill = this.scene.add
        .rectangle(barX, barY, fullWidth, 5, 0x22c55e, 0.98)
        .setOrigin(0, 0.5)
      this.playerHpFill.setDepth(23)
    } else {
      this.playerHpFill.setPosition(barX, barY)
    }
    this.playerHpFill.setDisplaySize(Math.max(2, fullWidth * ratio), 5)

    if (this.uiHpFill) {
      this.uiHpFill.setDisplaySize(Math.max(2, 128 * ratio), 12)
    }
    if (this.uiHpText) {
      this.uiHpText.setText(`HP ${run.hp}/${run.maxHp}`)
    }
  }

  updateVision(run: RunState) {
    const radius = DungeonVisualSystem.VISION_RADIUS
    const radiusSq = radius * radius
    for (let y = 0; y < MAX_MAP_H; y++) {
      for (let x = 0; x < MAX_MAP_W; x++) {
        const fog = this.fogTiles.get(keyOf({ x, y }))
        if (!fog) continue

        const dx = x - run.player.x
        const dy = y - run.player.y
        const inSight = dx * dx + dy * dy <= radiusSq
        const inFloor = x >= 0 && y >= 0 && x < run.floorData.width && y < run.floorData.height
        fog.setAlpha(inSight && inFloor ? 0 : 1)
      }
    }
  }

  getPlayerSprite() {
    return this.playerSprite
  }

  getEnemySprite(id: string) {
    return this.enemyVisuals.get(id)?.sprite
  }

  killPlayerTweens() {
    if (this.playerSprite) {
      this.scene.tweens.killTweensOf(this.playerSprite)
    }
  }

  private createFogLayer() {
    for (let y = 0; y < MAX_MAP_H; y++) {
      for (let x = 0; x < MAX_MAP_W; x++) {
        const fog = this.scene.add.rectangle(
          x * TILE + TILE / 2,
          y * TILE + TILE / 2,
          TILE + 1,
          TILE + 1,
          0x000000,
          1,
        )
        fog.setDepth(30)
        this.fogTiles.set(keyOf({ x, y }), fog)
      }
    }
  }
}

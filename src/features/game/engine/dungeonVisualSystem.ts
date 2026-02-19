import type Phaser from 'phaser'

import {
  type ChestTile,
  type FloorEventTile,
  MAX_MAP_H,
  MAX_MAP_W,
  clamp,
  keyOf,
  TILE,
  type Pos,
  type RunState,
} from './model'
import {
  getHeroFrame0Key,
  getHeroIdleAnimKey,
  getHeroWalkAnimKey,
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
  private currentHeroClass: RunState['heroClass'] = 'knight'
  private playerSprite?: Phaser.GameObjects.Sprite
  private playerHpBg?: Phaser.GameObjects.Rectangle
  private playerHpFill?: Phaser.GameObjects.Rectangle
  private uiHpBg?: Phaser.GameObjects.Rectangle
  private uiHpFill?: Phaser.GameObjects.Rectangle
  private uiHpText?: Phaser.GameObjects.Text
  private wallGroup?: Phaser.GameObjects.Group
  private enemyGroup?: Phaser.GameObjects.Group
  private potionGroup?: Phaser.GameObjects.Group
  private chestGroup?: Phaser.GameObjects.Group
  private eventGroup?: Phaser.GameObjects.Group
  private exitOrb?: Phaser.GameObjects.Container
  private enemyVisuals = new Map<string, EnemyVisual>()
  private potionVisuals = new Map<string, Phaser.GameObjects.Container>()
  private chestVisuals = new Map<string, Phaser.GameObjects.Container>()
  private eventVisuals = new Map<string, Phaser.GameObjects.Container>()
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
    this.currentHeroClass = run.heroClass
    this.killPlayerTweens()

    this.wallGroup?.clear(true, true)
    this.enemyGroup?.clear(true, true)
    this.potionGroup?.clear(true, true)
    this.chestGroup?.clear(true, true)
    this.eventGroup?.clear(true, true)
    if (this.exitOrb) {
      this.scene.tweens.killTweensOf(this.exitOrb)
      this.scene.tweens.killTweensOf(this.exitOrb.list)
      this.exitOrb.destroy()
      this.exitOrb = undefined
    }
    this.enemyVisuals.clear()
    this.potionVisuals.clear()
    this.chestVisuals.clear()
    this.eventVisuals.clear()
    this.fogTiles.forEach((tile) => tile.destroy())
    this.fogTiles.clear()

    this.wallGroup = this.scene.add.group()
    this.enemyGroup = this.scene.add.group()
    this.potionGroup = this.scene.add.group()
    this.chestGroup = this.scene.add.group()
    this.eventGroup = this.scene.add.group()

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
      const potion = this.createPotionVisual(pos)
      this.potionGroup.add(potion)
      this.potionVisuals.set(keyOf(pos), potion)
    }
    for (const chest of run.floorData.chests) {
      const chestVisual = this.createChestVisual(chest)
      this.chestGroup.add(chestVisual)
      this.chestVisuals.set(keyOf(chest.pos), chestVisual)
    }
    for (const eventTile of run.floorData.events) {
      const eventVisual = this.createEventVisual(eventTile)
      this.eventGroup.add(eventVisual)
      this.eventVisuals.set(keyOf(eventTile.pos), eventVisual)
    }

    const exitOrb = this.createPortalVisual(run.floorData.exit)
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
        getHeroFrame0Key(run.heroClass),
      )
      this.playerSprite.setDisplaySize(30, 30)
      this.playerSprite.play(getHeroIdleAnimKey(run.heroClass))
    } else {
      this.playerSprite.setTexture(getHeroFrame0Key(run.heroClass))
      this.playerSprite.play(getHeroIdleAnimKey(run.heroClass), true)
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

  consumeTrapVisual(pos: Pos) {
    // Traps are intentionally invisible until triggered.
    void pos
  }

  consumeChestVisual(pos: Pos) {
    const key = keyOf(pos)
    const visual = this.chestVisuals.get(key)
    if (!visual) return
    this.scene.tweens.killTweensOf(visual)
    this.scene.tweens.killTweensOf(visual.list)
    visual.destroy()
    this.chestVisuals.delete(key)
  }

  consumeEventVisual(pos: Pos) {
    const key = keyOf(pos)
    const visual = this.eventVisuals.get(key)
    if (!visual) return
    this.scene.tweens.killTweensOf(visual)
    this.scene.tweens.killTweensOf(visual.list)
    visual.destroy()
    this.eventVisuals.delete(key)
  }

  tweenPlayerTo(pos: Pos, onUpdate: () => void) {
    if (!this.playerSprite) return
    this.scene.tweens.add({
      targets: this.playerSprite,
      x: pos.x * TILE + TILE / 2,
      y: pos.y * TILE + TILE / 2,
      duration: 110,
      ease: 'Quad.Out',
      onStart: () => this.playerSprite?.play(getHeroWalkAnimKey(this.currentHeroClass), true),
      onComplete: () => this.playerSprite?.play(getHeroIdleAnimKey(this.currentHeroClass), true),
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

  private createPotionVisual(pos: Pos) {
    const x = pos.x * TILE + TILE / 2
    const y = pos.y * TILE + TILE / 2
    const bottle = this.scene.add.ellipse(0, 3, 16, 18, 0xd1fae5, 0.9)
    bottle.setStrokeStyle(1, 0x99f6e4, 0.8)
    const liquid = this.scene.add.ellipse(0, 6, 10, 8, 0x22c55e, 0.95)
    const neck = this.scene.add.rectangle(0, -5, 8, 6, 0xccfbf1, 0.9)
    neck.setStrokeStyle(1, 0x99f6e4, 0.8)
    const cork = this.scene.add.rectangle(0, -9, 6, 3, 0x92400e, 0.95)
    const shine = this.scene.add.ellipse(-4, 2, 3, 6, 0xffffff, 0.55)

    const container = this.scene.add.container(x, y, [bottle, liquid, neck, cork, shine])
    container.setSize(20, 24)
    container.setDepth(2)
    container.setPosition(x, y)
    return container
  }

  private createPortalVisual(pos: Pos) {
    const x = pos.x * TILE + TILE / 2
    const y = pos.y * TILE + TILE / 2
    const outer = this.scene.add.ellipse(0, 0, 28, 28, 0x7c3aed, 0.45)
    outer.setStrokeStyle(2, 0xa78bfa, 0.9)
    const ring = this.scene.add.ellipse(0, 0, 20, 20, 0x4c1d95, 0.75)
    ring.setStrokeStyle(2, 0xc4b5fd, 0.85)
    const core = this.scene.add.ellipse(0, 0, 12, 12, 0xddd6fe, 0.9)
    const sparkA = this.scene.add.rectangle(0, 0, 2, 10, 0xe9d5ff, 0.9)
    const sparkB = this.scene.add.rectangle(0, 0, 10, 2, 0xe9d5ff, 0.9)

    const container = this.scene.add.container(x, y, [outer, ring, core, sparkA, sparkB])
    container.setSize(28, 28)
    container.setDepth(3)
    container.setPosition(x, y)

    this.scene.tweens.add({
      targets: container,
      angle: 360,
      duration: 2800,
      repeat: -1,
      ease: 'Linear',
    })
    this.scene.tweens.add({
      targets: [outer, core],
      alpha: { from: 0.55, to: 0.95 },
      duration: 760,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.InOut',
    })

    return container
  }

  private createChestVisual(chest: ChestTile) {
    const x = chest.pos.x * TILE + TILE / 2
    const y = chest.pos.y * TILE + TILE / 2
    const wood = this.scene.add.rectangle(0, 3, 18, 12, 0x7c2d12, 0.95)
    wood.setStrokeStyle(1, 0xea580c, 0.9)
    const lid = this.scene.add.rectangle(0, -4, 20, 8, 0x9a3412, 0.95)
    lid.setStrokeStyle(1, 0xfb923c, 0.9)
    const lockColor = chest.rarity === 'rare' ? 0xfde047 : 0xd4d4d8
    const lock = this.scene.add.rectangle(0, 2, 4, 5, lockColor, 0.95)

    const container = this.scene.add.container(x, y, [wood, lid, lock])
    container.setDepth(2)
    container.setSize(20, 20)
    container.setPosition(x, y)
    this.scene.tweens.add({
      targets: [lid, lock],
      y: '-=1.2',
      duration: 650,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.InOut',
    })
    return container
  }

  private createEventVisual(eventTile: FloorEventTile) {
    const x = eventTile.pos.x * TILE + TILE / 2
    const y = eventTile.pos.y * TILE + TILE / 2
    const styleByKind = {
      shop: { fill: 0x1d4ed8, stroke: 0x93c5fd, symbol: '$' },
      altar: { fill: 0x7f1d1d, stroke: 0xfca5a5, symbol: '+' },
      gamble: { fill: 0x365314, stroke: 0xb9f99d, symbol: '?' },
    }[eventTile.kind]

    const base = this.scene.add.circle(0, 0, 11, styleByKind.fill, 0.9)
    base.setStrokeStyle(2, styleByKind.stroke, 0.9)
    const label = this.scene.add.text(0, 0, styleByKind.symbol, {
      color: '#f8fafc',
      fontFamily: 'monospace',
      fontSize: '13px',
    })
    label.setOrigin(0.5)
    const glow = this.scene.add.circle(0, 0, 15, styleByKind.stroke, 0.18)

    const container = this.scene.add.container(x, y, [glow, base, label])
    container.setDepth(2)
    container.setSize(24, 24)
    container.setPosition(x, y)
    this.scene.tweens.add({
      targets: glow,
      alpha: { from: 0.12, to: 0.32 },
      duration: 700,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.InOut',
    })

    return container
  }
}

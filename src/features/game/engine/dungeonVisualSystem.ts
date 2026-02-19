import type Phaser from 'phaser'

import { DungeonObjectVisualFactory } from './dungeonObjectVisualFactory'
import { EnemyVisualRegistry } from './enemyVisualRegistry'
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
  getHeroFrame0Key,
  getHeroIdleAnimKey,
  getHeroWalkAnimKey,
} from './spriteSheet'

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
  private trapGroup?: Phaser.GameObjects.Group
  private chestGroup?: Phaser.GameObjects.Group
  private eventGroup?: Phaser.GameObjects.Group
  private portalAuraGroup?: Phaser.GameObjects.Group
  private exitOrb?: Phaser.GameObjects.Container
  private potionVisuals = new Map<string, Phaser.GameObjects.Container>()
  private trapVisuals = new Map<string, Phaser.GameObjects.Container>()
  private chestVisuals = new Map<string, Phaser.GameObjects.Container>()
  private eventVisuals = new Map<string, Phaser.GameObjects.Container>()
  private fogTiles = new Map<string, Phaser.GameObjects.Rectangle>()
  private readonly objectVisualFactory: DungeonObjectVisualFactory
  private readonly enemyVisualRegistry: EnemyVisualRegistry

  constructor(private readonly scene: Phaser.Scene) {
    this.objectVisualFactory = new DungeonObjectVisualFactory(scene)
    this.enemyVisualRegistry = new EnemyVisualRegistry(scene)
  }

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
    this.trapGroup?.clear(true, true)
    this.chestGroup?.clear(true, true)
    this.eventGroup?.clear(true, true)
    this.portalAuraGroup?.clear(true, true)
    if (this.exitOrb) {
      this.scene.tweens.killTweensOf(this.exitOrb)
      this.scene.tweens.killTweensOf(this.exitOrb.list)
      this.exitOrb.destroy()
      this.exitOrb = undefined
    }
    this.enemyVisualRegistry.clear()
    this.potionVisuals.clear()
    this.trapVisuals.clear()
    this.chestVisuals.clear()
    this.eventVisuals.clear()
    this.fogTiles.forEach((tile) => tile.destroy())
    this.fogTiles.clear()

    this.wallGroup = this.scene.add.group()
    this.enemyGroup = this.scene.add.group()
    this.enemyVisualRegistry.setGroup(this.enemyGroup)
    this.potionGroup = this.scene.add.group()
    this.trapGroup = this.scene.add.group()
    this.chestGroup = this.scene.add.group()
    this.eventGroup = this.scene.add.group()
    this.portalAuraGroup = this.scene.add.group()

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
      const potion = this.objectVisualFactory.createPotionVisual(pos)
      this.potionGroup.add(potion)
      this.potionVisuals.set(keyOf(pos), potion)
    }
    for (const trap of run.floorData.traps) {
      const trapVisual = this.objectVisualFactory.createTrapVisual(trap.pos, trap.kind)
      this.trapGroup.add(trapVisual)
      this.trapVisuals.set(keyOf(trap.pos), trapVisual)
    }
    for (const chest of run.floorData.chests) {
      const chestVisual = this.objectVisualFactory.createChestVisual(chest)
      this.chestGroup.add(chestVisual)
      this.chestVisuals.set(keyOf(chest.pos), chestVisual)
    }
    for (const eventTile of run.floorData.events) {
      const eventVisual = this.objectVisualFactory.createEventVisual(eventTile)
      this.eventGroup.add(eventVisual)
      this.eventVisuals.set(keyOf(eventTile.pos), eventVisual)
    }

    const exitOrb = this.objectVisualFactory.createPortalVisual(run.floorData.exit)
    this.exitOrb = exitOrb
    this.objectVisualFactory.createPortalAuraTiles(
      this.portalAuraGroup,
      run.floorData.exit,
      run.floorData.width,
      run.floorData.height,
    )

    for (const enemy of run.floorData.enemies) {
      this.addEnemyVisual(enemy)
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
    const key = keyOf(pos)
    const visual = this.trapVisuals.get(key)
    if (!visual) return
    this.scene.tweens.killTweensOf(visual)
    this.scene.tweens.killTweensOf(visual.list)
    visual.destroy()
    this.trapVisuals.delete(key)
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

  tweenPlayerTo(pos: Pos, onUpdate: () => void, onComplete?: () => void) {
    if (!this.playerSprite) return
    this.scene.tweens.add({
      targets: this.playerSprite,
      x: pos.x * TILE + TILE / 2,
      y: pos.y * TILE + TILE / 2,
      duration: 110,
      ease: 'Quad.Out',
      onStart: () => this.playerSprite?.play(getHeroWalkAnimKey(this.currentHeroClass), true),
      onComplete: () => {
        this.playerSprite?.play(getHeroIdleAnimKey(this.currentHeroClass), true)
        onComplete?.()
      },
      onUpdate,
    })
  }

  moveEnemyVisual(id: string, from: Pos, to: Pos) {
    this.enemyVisualRegistry.move(id, from, to)
  }

  destroyEnemyVisual(id: string) {
    this.enemyVisualRegistry.destroy(id)
  }

  addEnemyVisual(enemy: RunState['floorData']['enemies'][number]) {
    this.enemyVisualRegistry.add(enemy)
  }

  updateEnemyHpBar(run: RunState, id: string) {
    this.enemyVisualRegistry.updateHp(run, id)
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
    return this.enemyVisualRegistry.getSprite(id)
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

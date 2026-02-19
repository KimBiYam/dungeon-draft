import type Phaser from 'phaser'

import { type ChestTile, type FloorEventTile, TILE, type Pos, type TrapKind } from './model'

export class DungeonObjectVisualFactory {
  constructor(private readonly scene: Phaser.Scene) {}

  createPotionVisual(pos: Pos) {
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

  createTrapVisual(pos: Pos, kind: TrapKind) {
    const x = pos.x * TILE + TILE / 2
    const y = pos.y * TILE + TILE / 2
    const tone = {
      spike: { fill: 0x94a3b8, stroke: 0xe2e8f0 },
      flame: { fill: 0xf97316, stroke: 0xfdba74 },
      venom: { fill: 0x16a34a, stroke: 0x86efac },
    }[kind]
    const base = this.scene.add.polygon(0, 0, [-10, 8, 0, -10, 10, 8], tone.fill, 0.85)
    base.setStrokeStyle(1, tone.stroke, 0.9)
    const rune = this.scene.add.circle(0, 2, 3, tone.stroke, 0.75)
    const container = this.scene.add.container(x, y, [base, rune])
    container.setDepth(2)
    container.setSize(20, 20)
    container.setAlpha(0)
    return container
  }

  createChestVisual(chest: ChestTile) {
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

  createEventVisual(eventTile: FloorEventTile) {
    const x = eventTile.pos.x * TILE + TILE / 2
    const y = eventTile.pos.y * TILE + TILE / 2
    if (eventTile.kind === 'shop') {
      return this.createShopVisual(x, y)
    }

    const styleByKind = {
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

  createPortalVisual(pos: Pos) {
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

  createPortalAuraTiles(
    group: Phaser.GameObjects.Group | undefined,
    exit: Pos,
    width: number,
    height: number,
  ) {
    if (!group) return
    const positions = [
      { x: exit.x + 1, y: exit.y },
      { x: exit.x - 1, y: exit.y },
      { x: exit.x, y: exit.y + 1 },
      { x: exit.x, y: exit.y - 1 },
    ].filter((pos) => pos.x > 0 && pos.y > 0 && pos.x < width - 1 && pos.y < height - 1)

    for (const pos of positions) {
      const tile = this.scene.add.rectangle(
        pos.x * TILE + TILE / 2,
        pos.y * TILE + TILE / 2,
        TILE - 8,
        TILE - 8,
        0x22d3ee,
        0.16,
      )
      tile.setStrokeStyle(1, 0x67e8f9, 0.35)
      tile.setDepth(1)
      group.add(tile)
      this.scene.tweens.add({
        targets: tile,
        alpha: { from: 0.12, to: 0.24 },
        duration: 900,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.InOut',
      })
    }
  }

  private createShopVisual(x: number, y: number) {
    const awning = this.scene.add.rectangle(0, -7, 22, 6, 0xdc2626, 0.95)
    awning.setStrokeStyle(1, 0xfca5a5, 0.85)
    const stall = this.scene.add.rectangle(0, 1, 18, 8, 0x854d0e, 0.95)
    stall.setStrokeStyle(1, 0xfacc15, 0.75)
    const merchantHead = this.scene.add.circle(0, -1, 3, 0xfde68a, 0.95)
    const merchantBody = this.scene.add.rectangle(0, 4, 6, 6, 0x1d4ed8, 0.95)
    const lantern = this.scene.add.circle(7, -1, 2, 0xfef08a, 0.9)
    const glow = this.scene.add.circle(0, 0, 16, 0xfacc15, 0.16)

    const container = this.scene.add.container(x, y, [
      glow,
      awning,
      stall,
      merchantBody,
      merchantHead,
      lantern,
    ])
    container.setDepth(2)
    container.setSize(24, 24)
    container.setPosition(x, y)
    this.scene.tweens.add({
      targets: lantern,
      alpha: { from: 0.5, to: 1 },
      duration: 600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.InOut',
    })
    return container
  }
}

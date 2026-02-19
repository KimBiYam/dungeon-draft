import type Phaser from 'phaser'

import { keyOf, MAX_MAP_H, MAX_MAP_W, TILE, type RunState } from './model'

export class FogOfWarRenderer {
  private readonly fogTiles = new Map<string, Phaser.GameObjects.Rectangle>()

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly visionRadius: number,
  ) {}

  clear() {
    this.fogTiles.forEach((tile) => tile.destroy())
    this.fogTiles.clear()
  }

  createLayer() {
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

  update(run: RunState) {
    const radiusSq = this.visionRadius * this.visionRadius
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
}

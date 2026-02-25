import type Phaser from 'phaser'

import { clamp, TILE, type Pos, type RunState } from './model'
import { getMonsterFrame0Key, getMonsterIdleAnimKey } from './spriteSheet'

type EnemyVisual = {
  shadow: Phaser.GameObjects.Ellipse
  sprite: Phaser.GameObjects.Sprite
  hpBg: Phaser.GameObjects.Rectangle
  hpFill: Phaser.GameObjects.Rectangle
}

export class EnemyVisualRegistry {
  private readonly enemyVisuals = new Map<string, EnemyVisual>()
  private enemyGroup?: Phaser.GameObjects.Group

  constructor(private readonly scene: Phaser.Scene) {}

  setGroup(group: Phaser.GameObjects.Group | undefined) {
    this.enemyGroup = group
  }

  clear() {
    this.enemyVisuals.clear()
  }

  add(enemy: RunState['floorData']['enemies'][number]) {
    if (!this.enemyGroup) return
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

  move(id: string, from: Pos, to: Pos) {
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

  destroy(id: string) {
    const visual = this.enemyVisuals.get(id)
    if (!visual) return
    visual.shadow.destroy()
    visual.sprite.destroy()
    visual.hpBg.destroy()
    visual.hpFill.destroy()
    this.enemyVisuals.delete(id)
  }

  updateHp(run: RunState, id: string) {
    const enemy = run.floorData.enemies.find((item) => item.id === id)
    const visual = this.enemyVisuals.get(id)
    if (!enemy || !visual) return
    const ratio = clamp(enemy.hp / enemy.maxHp, 0.08, 1)
    visual.hpFill.setDisplaySize(28 * ratio, 5)
  }

  getSprite(id: string) {
    return this.enemyVisuals.get(id)?.sprite
  }
}

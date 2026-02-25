import type Phaser from 'phaser'

import { TILE, type Pos } from './model'

export class SceneEffects {
  constructor(
    private readonly scene: Phaser.Scene,
    private readonly phaser: typeof import('phaser'),
  ) {}

  playOnceThen(
    sprite: Phaser.GameObjects.Sprite | undefined,
    anim: string,
    fallback: string,
  ) {
    if (!sprite) return
    sprite.play(anim, true)
    sprite.once(this.phaser.Animations.Events.ANIMATION_COMPLETE, () => {
      if (sprite.active) sprite.play(fallback, true)
    })
  }

  cameraShake(duration: number) {
    this.scene.cameras.main.shake(duration, 0.004)
  }

  trapHitFlash() {
    this.scene.cameras.main.flash(140, 220, 38, 38, true)
  }

  hitFlash(pos: Pos, color: number) {
    const flash = this.scene.add.circle(
      pos.x * TILE + TILE / 2,
      pos.y * TILE + TILE / 2,
      16,
      color,
      0.6,
    )
    this.scene.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 180,
      onComplete: () => flash.destroy(),
    })
  }
}

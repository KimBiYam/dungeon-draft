import type Phaser from 'phaser'

export const HERO_FRAME_0 = 'hero_frame_0'
export const MONSTER_FRAME_0 = 'monster_frame_0'
export const HERO_IDLE_ANIM = 'hero-idle'
export const HERO_WALK_ANIM = 'hero-walk'
export const HERO_ATTACK_ANIM = 'hero-attack'
export const HERO_HURT_ANIM = 'hero-hurt'
export const MONSTER_IDLE_ANIM = 'monster-idle'
export const MONSTER_ATTACK_ANIM = 'monster-attack'
export const MONSTER_HURT_ANIM = 'monster-hurt'

export function ensureSpriteSheets(scene: Phaser.Scene) {
  for (let i = 0; i < 12; i++) {
    const key = `hero_frame_${i}`
    if (scene.textures.exists(key)) {
      continue
    }
    const g = scene.add.graphics()
    const walk = i >= 2 && i <= 5
    const attack = i >= 6 && i <= 8
    const hurt = i >= 9 && i <= 10
    const legOffset = walk ? ((i % 2 === 0 ? -1 : 1) * 2) : 0

    g.fillStyle(0x000000, 0)
    g.fillRect(0, 0, 32, 32)
    g.fillStyle(0xe2e8f0, 1)
    g.fillCircle(16, 8, 5)
    g.fillStyle(hurt ? 0x60a5fa : 0x2563eb, 1)
    g.fillRect(10, 12, 12, 12)
    g.fillStyle(0x0f172a, 1)
    g.fillRect(10 + legOffset, 24, 4, 6)
    g.fillRect(18 - legOffset, 24, 4, 6)
    g.fillStyle(0xf59e0b, 1)
    const swordX = attack ? 24 : 22
    const swordY = attack ? 8 : 11
    g.fillRect(swordX, swordY, 2, 12)
    g.fillStyle(0xcbd5e1, 1)
    g.fillRect(swordX + 1, swordY, 4, 2)
    g.generateTexture(key, 32, 32)
    g.destroy()
  }

  for (let i = 0; i < 8; i++) {
    const key = `monster_frame_${i}`
    if (scene.textures.exists(key)) {
      continue
    }
    const g = scene.add.graphics()
    const attack = i >= 4 && i <= 5
    const hurt = i >= 6
    const mouthH = attack ? 6 : 3

    g.fillStyle(0x000000, 0)
    g.fillRect(0, 0, 32, 32)
    g.fillStyle(0xbe123c, 1)
    g.fillTriangle(9, 11, 13, 4, 15, 11)
    g.fillTriangle(23, 11, 19, 4, 17, 11)
    g.fillStyle(hurt ? 0xfb7185 : 0xe11d48, 1)
    g.fillRect(8, 10, 16, 16)
    g.fillStyle(0xffffff, 1)
    g.fillCircle(13, 15, 2)
    g.fillCircle(19, 15, 2)
    g.fillStyle(0x111827, 1)
    g.fillRect(13, 21, 6, mouthH)
    g.fillStyle(0xfecdd3, 1)
    g.fillRect(14, 22, 2, Math.max(1, mouthH - 1))
    g.fillRect(17, 22, 2, Math.max(1, mouthH - 1))
    g.generateTexture(key, 32, 32)
    g.destroy()
  }
}

export function ensureAnimations(scene: Phaser.Scene) {
  if (!scene.anims.exists(HERO_IDLE_ANIM)) {
    scene.anims.create({
      key: HERO_IDLE_ANIM,
      frames: [{ key: 'hero_frame_0' }, { key: 'hero_frame_1' }],
      frameRate: 4,
      repeat: -1,
    })
  }
  if (!scene.anims.exists(HERO_WALK_ANIM)) {
    scene.anims.create({
      key: HERO_WALK_ANIM,
      frames: [2, 3, 4, 5].map((i) => ({ key: `hero_frame_${i}` })),
      frameRate: 10,
      repeat: -1,
    })
  }
  if (!scene.anims.exists(HERO_ATTACK_ANIM)) {
    scene.anims.create({
      key: HERO_ATTACK_ANIM,
      frames: [6, 7, 8].map((i) => ({ key: `hero_frame_${i}` })),
      frameRate: 14,
      repeat: 0,
    })
  }
  if (!scene.anims.exists(HERO_HURT_ANIM)) {
    scene.anims.create({
      key: HERO_HURT_ANIM,
      frames: [9, 10].map((i) => ({ key: `hero_frame_${i}` })),
      frameRate: 10,
      repeat: 0,
    })
  }

  if (!scene.anims.exists(MONSTER_IDLE_ANIM)) {
    scene.anims.create({
      key: MONSTER_IDLE_ANIM,
      frames: [0, 1, 2, 3].map((i) => ({ key: `monster_frame_${i}` })),
      frameRate: 6,
      repeat: -1,
    })
  }
  if (!scene.anims.exists(MONSTER_ATTACK_ANIM)) {
    scene.anims.create({
      key: MONSTER_ATTACK_ANIM,
      frames: [4, 5].map((i) => ({ key: `monster_frame_${i}` })),
      frameRate: 10,
      repeat: 0,
    })
  }
  if (!scene.anims.exists(MONSTER_HURT_ANIM)) {
    scene.anims.create({
      key: MONSTER_HURT_ANIM,
      frames: [6, 7].map((i) => ({ key: `monster_frame_${i}` })),
      frameRate: 10,
      repeat: 0,
    })
  }
}

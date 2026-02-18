import type Phaser from 'phaser'

import { MonsterTypeCatalog, type MonsterType } from './monsterTypes'

export const HERO_FRAME_0 = 'hero_frame_0'
export const HERO_IDLE_ANIM = 'hero-idle'
export const HERO_WALK_ANIM = 'hero-walk'
export const HERO_ATTACK_ANIM = 'hero-attack'
export const HERO_HURT_ANIM = 'hero-hurt'

export function getMonsterFrame0Key(typeId: string) {
  return `monster_${typeId}_frame_0`
}

function getMonsterFrameKey(typeId: string, frameIndex: number) {
  return `monster_${typeId}_frame_${frameIndex}`
}

export function getMonsterIdleAnimKey(typeId: string) {
  return `monster-${typeId}-idle`
}

export function getMonsterAttackAnimKey(typeId: string) {
  return `monster-${typeId}-attack`
}

export function getMonsterHurtAnimKey(typeId: string) {
  return `monster-${typeId}-hurt`
}

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
    const legOffset = walk ? (i % 2 === 0 ? -2 : 2) : 0

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

  const monsterTypes = new MonsterTypeCatalog().list()
  for (const monsterType of monsterTypes) {
    for (let i = 0; i < 8; i++) {
      const key = getMonsterFrameKey(monsterType.id, i)
      if (scene.textures.exists(key)) {
        continue
      }
      const g = scene.add.graphics()
      drawMonsterFrame(g, monsterType, i)
      g.generateTexture(key, 32, 32)
      g.destroy()
    }
  }
}

function drawMonsterFrame(g: Phaser.GameObjects.Graphics, monsterType: MonsterType, frame: number) {
  const attack = frame >= 4 && frame <= 5
  const hurt = frame >= 6

  g.fillStyle(0x000000, 0)
  g.fillRect(0, 0, 32, 32)

  const bodyColor = hurt ? 0xfda4af : monsterType.tint

  switch (monsterType.id) {
    case 'slime': {
      const wobble = frame % 2 === 0 ? 0 : 1
      g.fillStyle(bodyColor, 1)
      g.fillEllipse(16, 19, 18 + wobble * 2, 14 - wobble)
      g.fillStyle(0xffffff, 0.9)
      g.fillCircle(12, 17, 2)
      g.fillCircle(19, 17, 2)
      break
    }
    case 'goblin': {
      g.fillStyle(bodyColor, 1)
      g.fillRect(9, 11, 14, 14)
      g.fillTriangle(9, 12, 5, 8, 9, 16)
      g.fillTriangle(23, 12, 27, 8, 23, 16)
      g.fillStyle(0x111827, 1)
      g.fillRect(12, 20, 8, 3)
      break
    }
    case 'skeleton': {
      g.fillStyle(0xe5e7eb, 1)
      g.fillRect(10, 10, 12, 15)
      g.fillStyle(0x111827, 1)
      g.fillCircle(13, 14, 2)
      g.fillCircle(19, 14, 2)
      g.fillRect(12, 18, 8, 1)
      g.fillRect(12, 21, 8, 1)
      break
    }
    case 'orc': {
      const arm = attack ? 3 : 0
      g.fillStyle(bodyColor, 1)
      g.fillRect(8, 10, 16, 16)
      g.fillRect(7 - arm, 14, 4, 7)
      g.fillRect(21 + arm, 14, 4, 7)
      g.fillStyle(0xfef3c7, 1)
      g.fillRect(12, 21, 2, 3)
      g.fillRect(18, 21, 2, 3)
      break
    }
    case 'bat': {
      const wing = frame % 2 === 0 ? 0 : 3
      g.fillStyle(bodyColor, 1)
      g.fillEllipse(16, 16, 10, 12)
      g.fillTriangle(11, 14, 3, 18 + wing, 11, 20)
      g.fillTriangle(21, 14, 29, 18 + wing, 21, 20)
      break
    }
    case 'wolf': {
      const step = frame % 2 === 0 ? 0 : 1
      g.fillStyle(bodyColor, 1)
      g.fillRect(8, 14, 16, 9)
      g.fillTriangle(24, 14, 29, 16, 24, 19)
      g.fillTriangle(10, 14, 8, 10 - step, 12, 14)
      g.fillTriangle(15, 14, 13, 10 + step, 17, 14)
      break
    }
    case 'mimic': {
      const lid = attack ? 4 : 1
      g.fillStyle(0x7c4a03, 1)
      g.fillRect(9, 16, 14, 9)
      g.fillStyle(bodyColor, 1)
      g.fillRect(9, 11 - lid, 14, 5)
      g.fillStyle(0xffffff, 1)
      g.fillRect(12, 18, 2, 2)
      g.fillRect(18, 18, 2, 2)
      break
    }
    case 'wraith': {
      const drift = frame % 2 === 0 ? 0 : 1
      g.fillStyle(bodyColor, 0.92)
      g.fillEllipse(16, 15, 13, 13)
      g.fillTriangle(10, 20, 8, 26 + drift, 14, 22)
      g.fillTriangle(16, 20, 15, 27 - drift, 19, 22)
      g.fillTriangle(22, 20, 24, 26 + drift, 18, 22)
      break
    }
    case 'cultist': {
      g.fillStyle(bodyColor, 1)
      g.fillTriangle(16, 8, 8, 22, 24, 22)
      g.fillRect(10, 22, 12, 4)
      g.fillStyle(0xf8fafc, 0.9)
      g.fillCircle(13, 16, 1)
      g.fillCircle(19, 16, 1)
      break
    }
    case 'golem': {
      const shake = frame % 2 === 0 ? 0 : 1
      g.fillStyle(bodyColor, 1)
      g.fillRect(8, 9 + shake, 8, 8)
      g.fillRect(16, 9, 8, 8)
      g.fillRect(8, 17, 8, 8)
      g.fillRect(16, 17 - shake, 8, 8)
      g.fillStyle(0x1f2937, 1)
      g.fillRect(13, 14, 2, 2)
      g.fillRect(17, 14, 2, 2)
      break
    }
    default: {
      g.fillStyle(bodyColor, 1)
      g.fillRect(8, 10, 16, 16)
      break
    }
  }

  g.fillStyle(0xffffff, 1)
  g.fillCircle(13, 15, 1.8)
  g.fillCircle(19, 15, 1.8)
  g.fillStyle(0x0f172a, 1)
  g.fillRect(13, attack ? 20 : 21, 6, attack ? 4 : 2)
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

  const monsterTypes = new MonsterTypeCatalog().list()
  for (const monsterType of monsterTypes) {
    const idleKey = getMonsterIdleAnimKey(monsterType.id)
    const attackKey = getMonsterAttackAnimKey(monsterType.id)
    const hurtKey = getMonsterHurtAnimKey(monsterType.id)

    if (!scene.anims.exists(idleKey)) {
      scene.anims.create({
        key: idleKey,
        frames: [0, 1, 2, 3].map((i) => ({ key: getMonsterFrameKey(monsterType.id, i) })),
        frameRate: 6,
        repeat: -1,
      })
    }
    if (!scene.anims.exists(attackKey)) {
      scene.anims.create({
        key: attackKey,
        frames: [4, 5].map((i) => ({ key: getMonsterFrameKey(monsterType.id, i) })),
        frameRate: 10,
        repeat: 0,
      })
    }
    if (!scene.anims.exists(hurtKey)) {
      scene.anims.create({
        key: hurtKey,
        frames: [6, 7].map((i) => ({ key: getMonsterFrameKey(monsterType.id, i) })),
        frameRate: 10,
        repeat: 0,
      })
    }
  }
}

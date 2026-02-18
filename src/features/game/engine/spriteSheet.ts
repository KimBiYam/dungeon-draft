import type Phaser from 'phaser'

import { MonsterTypeCatalog, type MonsterType } from './monsterTypes'
import type { HeroClassId } from './model'

function getHeroFrameKey(heroClass: HeroClassId, frameIndex: number) {
  return `hero_${heroClass}_frame_${frameIndex}`
}

export function getHeroFrame0Key(heroClass: HeroClassId) {
  return getHeroFrameKey(heroClass, 0)
}

export function getHeroIdleAnimKey(heroClass: HeroClassId) {
  return `hero-${heroClass}-idle`
}

export function getHeroWalkAnimKey(heroClass: HeroClassId) {
  return `hero-${heroClass}-walk`
}

export function getHeroAttackAnimKey(heroClass: HeroClassId) {
  return `hero-${heroClass}-attack`
}

export function getHeroHurtAnimKey(heroClass: HeroClassId) {
  return `hero-${heroClass}-hurt`
}

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
  const heroClasses: HeroClassId[] = ['knight', 'berserker', 'ranger']
  for (const heroClass of heroClasses) {
    for (let i = 0; i < 12; i++) {
      const key = getHeroFrameKey(heroClass, i)
      if (scene.textures.exists(key)) {
        continue
      }
      const g = scene.add.graphics()
      drawHeroFrame(g, heroClass, i)
      g.generateTexture(key, 32, 32)
      g.destroy()
    }
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

function drawHeroFrame(
  g: Phaser.GameObjects.Graphics,
  heroClass: HeroClassId,
  frame: number,
) {
  const walk = frame >= 2 && frame <= 5
  const attack = frame >= 6 && frame <= 8
  const hurt = frame >= 9 && frame <= 10
  const legOffset = walk ? (frame % 2 === 0 ? -2 : 2) : 0

  g.fillStyle(0x000000, 0)
  g.fillRect(0, 0, 32, 32)

  if (heroClass === 'knight') {
    g.fillStyle(0xe2e8f0, 1)
    g.fillCircle(16, 8, 5)
    g.fillStyle(hurt ? 0x93c5fd : 0x2563eb, 1)
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
    return
  }

  if (heroClass === 'berserker') {
    g.fillStyle(0xfca5a5, 1)
    g.fillCircle(16, 8, 5)
    g.fillStyle(hurt ? 0xfda4af : 0xb91c1c, 1)
    g.fillRect(10, 12, 12, 12)
    g.fillStyle(0x1f2937, 1)
    g.fillRect(10 + legOffset, 24, 4, 6)
    g.fillRect(18 - legOffset, 24, 4, 6)
    const axeX = attack ? 23 : 21
    const axeY = attack ? 9 : 12
    g.fillStyle(0x78350f, 1)
    g.fillRect(axeX, axeY, 2, 12)
    g.fillStyle(0xd1d5db, 1)
    g.fillTriangle(axeX + 1, axeY, axeX + 8, axeY + 2, axeX + 1, axeY + 5)
    return
  }

  g.fillStyle(0xfee2e2, 1)
  g.fillCircle(16, 8, 5)
  g.fillStyle(hurt ? 0x86efac : 0x15803d, 1)
  g.fillRect(10, 12, 12, 12)
  g.fillStyle(0x111827, 1)
  g.fillRect(10 + legOffset, 24, 4, 6)
  g.fillRect(18 - legOffset, 24, 4, 6)
  const bowX = attack ? 23 : 22
  const bowY = attack ? 9 : 12
  g.fillStyle(0x92400e, 1)
  g.fillRect(bowX, bowY, 2, 11)
  g.fillStyle(0xfef3c7, 1)
  g.fillRect(bowX - 1, bowY, 1, 11)
  g.fillStyle(0xfde68a, 1)
  if (attack) {
    g.fillRect(25, 10, 6, 1)
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
  const heroClasses: HeroClassId[] = ['knight', 'berserker', 'ranger']
  for (const heroClass of heroClasses) {
    const idleKey = getHeroIdleAnimKey(heroClass)
    const walkKey = getHeroWalkAnimKey(heroClass)
    const attackKey = getHeroAttackAnimKey(heroClass)
    const hurtKey = getHeroHurtAnimKey(heroClass)

    if (!scene.anims.exists(idleKey)) {
      scene.anims.create({
        key: idleKey,
        frames: [
          { key: getHeroFrameKey(heroClass, 0) },
          { key: getHeroFrameKey(heroClass, 1) },
        ],
        frameRate: 4,
        repeat: -1,
      })
    }
    if (!scene.anims.exists(walkKey)) {
      scene.anims.create({
        key: walkKey,
        frames: [2, 3, 4, 5].map((i) => ({ key: getHeroFrameKey(heroClass, i) })),
        frameRate: 10,
        repeat: -1,
      })
    }
    if (!scene.anims.exists(attackKey)) {
      scene.anims.create({
        key: attackKey,
        frames: [6, 7, 8].map((i) => ({ key: getHeroFrameKey(heroClass, i) })),
        frameRate: 14,
        repeat: 0,
      })
    }
    if (!scene.anims.exists(hurtKey)) {
      scene.anims.create({
        key: hurtKey,
        frames: [9, 10].map((i) => ({ key: getHeroFrameKey(heroClass, i) })),
        frameRate: 10,
        repeat: 0,
      })
    }
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

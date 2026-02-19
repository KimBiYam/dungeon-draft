import type Phaser from 'phaser'

import type { SfxEvent } from './audio'
import type { DungeonVisualSystem } from './dungeonVisualSystem'
import type { HeroRoleService } from './hero'
import type { TerrainRoleService } from './terrain'
import {
  clamp,
  samePos,
  type Pos,
  type RunState,
  type TrapKind,
} from './model'
import {
  getHeroAttackAnimKey,
  getHeroIdleAnimKey,
  getMonsterHurtAnimKey,
  getMonsterIdleAnimKey,
} from './spriteSheet'

type PlayOnceThen = (
  sprite: Phaser.GameObjects.Sprite | undefined,
  anim: string,
  fallback: string,
) => void

type ResolveEnemyCollisionParams = {
  run: RunState
  target: Pos
  heroRole: HeroRoleService
  visuals: DungeonVisualSystem
  playOnceThen: PlayOnceThen
  playAudio: (event: SfxEvent) => void
  pushLog: (message: string) => void
  hitFlash: (pos: Pos, color: number) => void
  cameraShake: (duration: number) => void
}

type ResolveTileEffectsParams = {
  run: RunState
  target: Pos
  terrainRole: TerrainRoleService
  playAudio: (event: SfxEvent) => void
  pushLog: (message: string) => void
  triggerTrapFlash: () => void
  cameraShake: (duration: number) => void
  visuals: DungeonVisualSystem
  applyTrapEffect: (kind: TrapKind) => number
  applyChestReward: (rarity: 'common' | 'rare') => string
  portalResonanceUsed: boolean
}

type ResolveTileEffectsResult = {
  diedByTrap: boolean
  portalResonanceUsed: boolean
}

export class TurnResolver {
  constructor(private readonly roll: (min: number, max: number) => number = defaultRoll) {}

  resolveEnemyCollision(params: ResolveEnemyCollisionParams) {
    const { run, target } = params
    const enemy = run.floorData.enemies.find((entry) => samePos(entry.pos, target))
    if (!enemy) {
      return { handled: false, heroDied: false }
    }

    const dmg = params.heroRole.calculateAttackDamage(run.atk)
    params.playOnceThen(
      params.visuals.getPlayerSprite(),
      getHeroAttackAnimKey(run.heroClass),
      getHeroIdleAnimKey(run.heroClass),
    )
    params.playAudio('heroAttack')
    enemy.hp -= dmg
    params.pushLog(`You slash for ${dmg}.`)
    params.hitFlash(target, 0xfb7185)
    params.playOnceThen(
      params.visuals.getEnemySprite(enemy.id),
      getMonsterHurtAnimKey(enemy.monsterTypeId),
      getMonsterIdleAnimKey(enemy.monsterTypeId),
    )
    if (enemy.hp <= 0) {
      run.floorData.enemies = run.floorData.enemies.filter((entry) => entry.id !== enemy.id)
      const xp = this.roll(5, 8) + run.floor
      run.xp += xp
      params.pushLog(`${enemy.monsterName} down. +${xp} XP.`)
      params.playAudio('enemyDefeat')
      params.cameraShake(120)
      params.visuals.destroyEnemyVisual(enemy.id)
    } else {
      params.playAudio('enemyHit')
      params.visuals.updateEnemyHpBar(run, enemy.id)
    }

    return { handled: true, heroDied: false }
  }

  resolveTileEffects(params: ResolveTileEffectsParams): ResolveTileEffectsResult {
    const { run, target } = params
    let portalUsed = params.portalResonanceUsed
    const isExit = samePos(target, run.floorData.exit)

    const potionIdx = run.floorData.potions.findIndex((potion) => samePos(potion, target))
    if (potionIdx >= 0) {
      run.floorData.potions.splice(potionIdx, 1)
      const heal = this.roll(7, 12)
      run.hp = clamp(run.hp + heal, 0, run.maxHp)
      params.pushLog(`Potion! +${heal} HP.`)
      params.playAudio('pickupPotion')
      params.visuals.consumePotionVisual(target)
    }

    const trapIdx = run.floorData.traps.findIndex((trap) => samePos(trap.pos, target))
    if (trapIdx >= 0) {
      const trap = run.floorData.traps.splice(trapIdx, 1)[0]
      const damage = params.applyTrapEffect(trap.kind)
      params.visuals.consumeTrapVisual(target)
      run.hp = clamp(run.hp - damage, 0, run.maxHp)
      params.pushLog(`${this.describeTrap(trap.kind)} trap! -${damage} HP.`)
      params.playAudio('trapTrigger')
      params.triggerTrapFlash()
      params.cameraShake(110)
      if (run.hp <= 0) {
        return { diedByTrap: true, portalResonanceUsed: portalUsed }
      }
    }

    if (
      !isExit &&
      !portalUsed &&
      params.terrainRole.isPortalResonanceTile(target, run.floorData.exit)
    ) {
      const heal = params.terrainRole.applyPortalResonance(run)
      portalUsed = true
      params.pushLog(`Portal resonance restores ${heal} HP.`)
      params.playAudio('pickupPotion')
    }

    const chestIdx = run.floorData.chests.findIndex((chest) => samePos(chest.pos, target))
    if (chestIdx >= 0) {
      const chest = run.floorData.chests.splice(chestIdx, 1)[0]
      params.visuals.consumeChestVisual(target)
      const rewardLog = params.applyChestReward(chest.rarity)
      params.pushLog(rewardLog)
      params.playAudio('chestOpen')
    }

    return { diedByTrap: false, portalResonanceUsed: portalUsed }
  }

  private describeTrap(kind: TrapKind) {
    if (kind === 'spike') return 'Spike'
    if (kind === 'flame') return 'Flame'
    return 'Venom'
  }
}

function defaultRoll(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

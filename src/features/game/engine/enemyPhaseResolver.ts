import type Phaser from 'phaser'

import type { SfxEvent } from './audio'
import type { DungeonVisualSystem } from './dungeonVisualSystem'
import { keyOf, samePos, type Pos, type RunState } from './model'
import { MonsterRoleService } from './monster'
import { MonsterTypeCatalog, scaleMonsterStats } from './monsterTypes'
import {
  getHeroHurtAnimKey,
  getHeroIdleAnimKey,
  getMonsterAttackAnimKey,
  getMonsterIdleAnimKey,
} from './spriteSheet'

type PlayOnceThen = (
  sprite: Phaser.GameObjects.Sprite | undefined,
  anim: string,
  fallback: string,
) => void

type EnemyPhaseParams = {
  run: RunState
  playOnceThen: PlayOnceThen
  pushLog: (message: string) => void
  playAudio: (sfx: SfxEvent) => void
  hitFlash: (pos: Pos, color: number) => void
  triggerGameOver: (message: string) => void
}

type EnemyEntity = RunState['floorData']['enemies'][number]

export class EnemyPhaseResolver {
  constructor(
    private readonly monsterRole: MonsterRoleService,
    private readonly monsterCatalog: MonsterTypeCatalog,
    private readonly visuals: DungeonVisualSystem,
    private readonly randomFloat: () => number,
  ) {}

  execute({
    run,
    playOnceThen,
    pushLog,
    playAudio,
    hitFlash,
    triggerGameOver,
  }: EnemyPhaseParams) {
    const occupied = new Set<string>(run.floorData.enemies.map((enemy) => keyOf(enemy.pos)))
    const actingEnemies = [...run.floorData.enemies]

    for (const enemy of actingEnemies) {
      const distance =
        Math.abs(enemy.pos.x - run.player.x) + Math.abs(enemy.pos.y - run.player.y)

      if (distance === 1) {
        const dead = this.resolveMeleeAttack(
          enemy,
          run,
          playOnceThen,
          pushLog,
          playAudio,
          hitFlash,
          triggerGameOver,
        )
        if (dead) {
          return true
        }
        continue
      }

      if (
        enemy.behavior === 'ranged' &&
        this.monsterRole.canUseRangedAttack(
          enemy.pos,
          run.player,
          (pos) => run.floorData.walls.has(keyOf(pos)),
        )
      ) {
        const dead = this.resolveRangedAttack(
          enemy,
          run,
          playOnceThen,
          pushLog,
          playAudio,
          hitFlash,
          triggerGameOver,
        )
        if (dead) {
          return true
        }
        continue
      }

      if (
        enemy.behavior === 'summoner' &&
        run.floorData.enemies.length < 14 &&
        this.monsterRole.shouldSummon(run.floor)
      ) {
        const summonPos = this.monsterRole.getSummonSpawnPos(enemy.pos, (pos) =>
          this.canOccupyEnemyTile(pos, run, occupied),
        )
        if (summonPos) {
          const summoned = this.createSummonedEnemy(summonPos, run)
          run.floorData.enemies.push(summoned)
          occupied.add(keyOf(summonPos))
          this.visuals.addEnemyVisual(summoned)
          pushLog(
            `${enemy.monsterName} (${this.monsterRole.getBehaviorLabel(enemy.behavior)}) summons a ${summoned.monsterName}.`,
          )
          continue
        }
      }

      if (this.randomFloat() < 0.3) {
        continue
      }

      const step =
        enemy.behavior === 'charger'
          ? this.monsterRole.getChargerStep(enemy.pos, run.player)
          : this.monsterRole.getChaseStep(enemy.pos, run.player)
      const candidate = { x: enemy.pos.x + step.x, y: enemy.pos.y + step.y }
      if (this.canOccupyEnemyTile(candidate, run, occupied)) {
        this.moveEnemy(enemy, candidate, occupied)
        continue
      }

      if (
        enemy.behavior === 'charger' &&
        (step.x === 2 || step.x === -2 || step.y === 2 || step.y === -2)
      ) {
        const fallback = {
          x: enemy.pos.x + Math.sign(step.x),
          y: enemy.pos.y + Math.sign(step.y),
        }
        if (this.canOccupyEnemyTile(fallback, run, occupied)) {
          this.moveEnemy(enemy, fallback, occupied)
        }
      }
    }

    return false
  }

  private resolveMeleeAttack(
    enemy: EnemyEntity,
    run: RunState,
    playOnceThen: PlayOnceThen,
    pushLog: (message: string) => void,
    playAudio: (sfx: SfxEvent) => void,
    hitFlash: (pos: Pos, color: number) => void,
    triggerGameOver: (message: string) => void,
  ) {
    playOnceThen(
      this.visuals.getEnemySprite(enemy.id),
      getMonsterAttackAnimKey(enemy.monsterTypeId),
      getMonsterIdleAnimKey(enemy.monsterTypeId),
    )
    const dmg = this.monsterRole.calculateAttackDamage(enemy.atk, run.def)
    run.hp -= dmg
    pushLog(`${enemy.monsterName} hits for ${dmg}.`)
    playAudio('heroHit')
    hitFlash(run.player, 0x38bdf8)
    playOnceThen(
      this.visuals.getPlayerSprite(),
      getHeroHurtAnimKey(run.heroClass),
      getHeroIdleAnimKey(run.heroClass),
    )
    if (run.hp <= 0) {
      triggerGameOver(`You died on floor ${run.floor}. Press New Run.`)
      return true
    }
    return false
  }

  private resolveRangedAttack(
    enemy: EnemyEntity,
    run: RunState,
    playOnceThen: PlayOnceThen,
    pushLog: (message: string) => void,
    playAudio: (sfx: SfxEvent) => void,
    hitFlash: (pos: Pos, color: number) => void,
    triggerGameOver: (message: string) => void,
  ) {
    playOnceThen(
      this.visuals.getEnemySprite(enemy.id),
      getMonsterAttackAnimKey(enemy.monsterTypeId),
      getMonsterIdleAnimKey(enemy.monsterTypeId),
    )
    const dmg = this.monsterRole.calculateAttackDamage(
      Math.max(1, enemy.atk - 1),
      run.def,
    )
    run.hp -= dmg
    pushLog(`${enemy.monsterName} fires for ${dmg}.`)
    playAudio('heroHit')
    hitFlash(run.player, 0x38bdf8)
    playOnceThen(
      this.visuals.getPlayerSprite(),
      getHeroHurtAnimKey(run.heroClass),
      getHeroIdleAnimKey(run.heroClass),
    )
    if (run.hp <= 0) {
      triggerGameOver(`You died on floor ${run.floor}. Press New Run.`)
      return true
    }
    return false
  }

  private canOccupyEnemyTile(pos: Pos, run: RunState, occupied: Set<string>) {
    if (
      pos.x < 0 ||
      pos.y < 0 ||
      pos.x >= run.floorData.width ||
      pos.y >= run.floorData.height
    ) {
      return false
    }
    const key = keyOf(pos)
    return (
      !run.floorData.walls.has(key) &&
      !occupied.has(key) &&
      !samePos(pos, run.player) &&
      !samePos(pos, run.floorData.exit)
    )
  }

  private createSummonedEnemy(pos: Pos, run: RunState): EnemyEntity {
    const baseType = this.monsterCatalog.getById('slime')
    const scaled = scaleMonsterStats(baseType, run.floor)
    const summonIndex = run.floorData.enemies.length + 1
    return {
      id: this.monsterRole.createSummonedEnemyId(run.floor, run.turn, summonIndex),
      pos,
      hp: Math.max(5, scaled.maxHp - 2),
      maxHp: Math.max(5, scaled.maxHp - 2),
      atk: Math.max(1, scaled.atk),
      behavior: 'normal',
      monsterTypeId: baseType.id,
      monsterName: `${baseType.name} Spawn`,
      monsterTint: baseType.tint,
    }
  }

  private moveEnemy(enemy: EnemyEntity, next: Pos, occupied: Set<string>) {
    const from = { ...enemy.pos }
    occupied.delete(keyOf(from))
    enemy.pos = next
    occupied.add(keyOf(next))
    this.visuals.moveEnemyVisual(enemy.id, from, next)
  }
}

import type { SfxEvent } from './audio'
import type { DungeonVisualSystem } from './dungeonVisualSystem'
import type { HeroRoleService } from './hero'
import type { LootService } from './lootService'
import type { FloorEventTile, Pos, RunState } from './model'
import { keyOf, samePos } from './model'
import type { SceneEffects } from './sceneEffects'
import type { TerrainRoleService } from './terrain'
import type { TurnResolver } from './turnResolver'

type AudioPlayer = (sound: SfxEvent) => void

type MoveResolverDeps = {
  turnResolver: TurnResolver
  heroRole: HeroRoleService
  terrainRole: TerrainRoleService
  visuals: DungeonVisualSystem
  effects: SceneEffects
  playAudio: AudioPlayer
  pushLog: (message: string) => void
  lootService: LootService
}

export type PlayerMoveResolution =
  | { status: 'out_of_bounds'; portalResonanceUsed: boolean }
  | { status: 'blocked'; portalResonanceUsed: boolean }
  | { status: 'enemy_collision'; portalResonanceUsed: boolean }
  | { status: 'trap_death'; portalResonanceUsed: boolean }
  | { status: 'event'; portalResonanceUsed: boolean; target: Pos; tile: FloorEventTile }
  | { status: 'exit'; portalResonanceUsed: boolean }
  | { status: 'moved'; portalResonanceUsed: boolean; target: Pos }

export class PlayerMoveResolver {
  constructor(private readonly deps: MoveResolverDeps) {}

  resolve(run: RunState, target: Pos, portalResonanceUsed: boolean): PlayerMoveResolution {
    if (
      target.x < 0 ||
      target.y < 0 ||
      target.x >= run.floorData.width ||
      target.y >= run.floorData.height
    ) {
      return { status: 'out_of_bounds', portalResonanceUsed }
    }

    if (run.floorData.walls.has(keyOf(target))) {
      this.deps.pushLog('Blocked by stone wall.')
      this.deps.playAudio('wallBlocked')
      this.deps.effects.cameraShake(90)
      return { status: 'blocked', portalResonanceUsed }
    }

    const enemyCollision = this.deps.turnResolver.resolveEnemyCollision({
      run,
      target,
      heroRole: this.deps.heroRole,
      visuals: this.deps.visuals,
      playOnceThen: this.deps.effects.playOnceThen.bind(this.deps.effects),
      playAudio: this.deps.playAudio,
      pushLog: this.deps.pushLog,
      hitFlash: this.deps.effects.hitFlash.bind(this.deps.effects),
      cameraShake: this.deps.effects.cameraShake.bind(this.deps.effects),
    })
    if (enemyCollision.handled) {
      return { status: 'enemy_collision', portalResonanceUsed }
    }

    run.player = target
    const tileEffects = this.deps.turnResolver.resolveTileEffects({
      run,
      target,
      terrainRole: this.deps.terrainRole,
      playAudio: this.deps.playAudio,
      pushLog: this.deps.pushLog,
      triggerTrapFlash: this.deps.effects.trapHitFlash.bind(this.deps.effects),
      cameraShake: this.deps.effects.cameraShake.bind(this.deps.effects),
      visuals: this.deps.visuals,
      applyTrapEffect: this.deps.lootService.applyTrapEffect.bind(this.deps.lootService),
      applyChestReward: this.deps.lootService.applyChestReward.bind(this.deps.lootService, run),
      portalResonanceUsed,
    })
    const nextPortalResonanceUsed = tileEffects.portalResonanceUsed
    if (tileEffects.diedByTrap) {
      return { status: 'trap_death', portalResonanceUsed: nextPortalResonanceUsed }
    }

    const eventTile = run.floorData.events.find((tile) => samePos(tile.pos, target))
    if (eventTile) {
      return {
        status: 'event',
        portalResonanceUsed: nextPortalResonanceUsed,
        target,
        tile: eventTile,
      }
    }

    if (samePos(target, run.floorData.exit)) {
      return { status: 'exit', portalResonanceUsed: nextPortalResonanceUsed }
    }

    return { status: 'moved', portalResonanceUsed: nextPortalResonanceUsed, target }
  }
}

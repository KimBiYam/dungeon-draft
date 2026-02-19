import { clamp, keyOf, type Pos, type RunState, type TrapTile } from './model'

export class TerrainRoleService {
  getNearbyTrapKeys(playerPos: Pos, traps: TrapTile[], radius = 1) {
    return traps
      .filter((trap) => this.getManhattanDistance(playerPos, trap.pos) <= radius)
      .map((trap) => keyOf(trap.pos))
  }

  isPortalResonanceTile(playerPos: Pos, exitPos: Pos) {
    return this.getManhattanDistance(playerPos, exitPos) === 1
  }

  applyPortalResonance(run: RunState) {
    const heal = 2
    run.hp = clamp(run.hp + heal, 0, run.maxHp)
    return heal
  }

  private getManhattanDistance(a: Pos, b: Pos) {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y)
  }
}

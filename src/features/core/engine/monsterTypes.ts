export interface MonsterType {
  id: string
  name: string
  tint: number
  behavior: MonsterBehavior
  baseHp: number
  hpPerFloor: number
  baseAtk: number
  atkPerFloor: number
}

export type MonsterBehavior = 'normal' | 'charger' | 'ranged' | 'summoner'

const MONSTER_TYPES: MonsterType[] = [
  { id: 'slime', name: 'Slime', tint: 0x34d399, behavior: 'normal', baseHp: 8, hpPerFloor: 1, baseAtk: 2, atkPerFloor: 0 },
  { id: 'goblin', name: 'Goblin', tint: 0x84cc16, behavior: 'charger', baseHp: 9, hpPerFloor: 1, baseAtk: 2, atkPerFloor: 0 },
  { id: 'skeleton', name: 'Skeleton', tint: 0xe5e7eb, behavior: 'ranged', baseHp: 10, hpPerFloor: 1, baseAtk: 2, atkPerFloor: 0 },
  { id: 'orc', name: 'Orc', tint: 0x65a30d, behavior: 'charger', baseHp: 12, hpPerFloor: 2, baseAtk: 3, atkPerFloor: 1 },
  { id: 'bat', name: 'Bat', tint: 0xa78bfa, behavior: 'normal', baseHp: 7, hpPerFloor: 1, baseAtk: 2, atkPerFloor: 0 },
  { id: 'wolf', name: 'Wolf', tint: 0x9ca3af, behavior: 'charger', baseHp: 10, hpPerFloor: 1, baseAtk: 3, atkPerFloor: 0 },
  { id: 'mimic', name: 'Mimic', tint: 0xf59e0b, behavior: 'summoner', baseHp: 11, hpPerFloor: 2, baseAtk: 3, atkPerFloor: 1 },
  { id: 'wraith', name: 'Wraith', tint: 0x60a5fa, behavior: 'ranged', baseHp: 9, hpPerFloor: 1, baseAtk: 3, atkPerFloor: 1 },
  { id: 'cultist', name: 'Cultist', tint: 0xf43f5e, behavior: 'summoner', baseHp: 10, hpPerFloor: 1, baseAtk: 3, atkPerFloor: 0 },
  { id: 'golem', name: 'Golem', tint: 0xa3a3a3, behavior: 'normal', baseHp: 13, hpPerFloor: 2, baseAtk: 2, atkPerFloor: 1 },
]

type ScaledStats = {
  maxHp: number
  atk: number
}

export function scaleMonsterStats(type: MonsterType, floor: number): ScaledStats {
  const floorStep = Math.max(0, floor - 1)
  return {
    maxHp: type.baseHp + type.hpPerFloor * floorStep,
    atk: type.baseAtk + type.atkPerFloor * floorStep,
  }
}

export class MonsterTypeCatalog {
  private readonly byId = new Map(MONSTER_TYPES.map((item) => [item.id, item]))

  list() {
    return MONSTER_TYPES
  }

  getById(id: string) {
    const type = this.byId.get(id)
    if (!type) {
      throw new Error(`Unknown monster type: ${id}`)
    }
    return type
  }
}

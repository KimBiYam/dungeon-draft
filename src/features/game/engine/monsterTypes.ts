export interface MonsterType {
  id: string
  name: string
  tint: number
  baseHp: number
  hpPerFloor: number
  baseAtk: number
  atkPerFloor: number
}

const MONSTER_TYPES: MonsterType[] = [
  { id: 'slime', name: 'Slime', tint: 0x34d399, baseHp: 8, hpPerFloor: 1, baseAtk: 2, atkPerFloor: 0 },
  { id: 'goblin', name: 'Goblin', tint: 0x84cc16, baseHp: 9, hpPerFloor: 1, baseAtk: 2, atkPerFloor: 0 },
  { id: 'skeleton', name: 'Skeleton', tint: 0xe5e7eb, baseHp: 10, hpPerFloor: 1, baseAtk: 2, atkPerFloor: 0 },
  { id: 'orc', name: 'Orc', tint: 0x65a30d, baseHp: 12, hpPerFloor: 2, baseAtk: 3, atkPerFloor: 1 },
  { id: 'bat', name: 'Bat', tint: 0xa78bfa, baseHp: 7, hpPerFloor: 1, baseAtk: 2, atkPerFloor: 0 },
  { id: 'wolf', name: 'Wolf', tint: 0x9ca3af, baseHp: 10, hpPerFloor: 1, baseAtk: 3, atkPerFloor: 0 },
  { id: 'mimic', name: 'Mimic', tint: 0xf59e0b, baseHp: 11, hpPerFloor: 2, baseAtk: 3, atkPerFloor: 1 },
  { id: 'wraith', name: 'Wraith', tint: 0x60a5fa, baseHp: 9, hpPerFloor: 1, baseAtk: 3, atkPerFloor: 1 },
  { id: 'cultist', name: 'Cultist', tint: 0xf43f5e, baseHp: 10, hpPerFloor: 1, baseAtk: 3, atkPerFloor: 0 },
  { id: 'golem', name: 'Golem', tint: 0xa3a3a3, baseHp: 13, hpPerFloor: 2, baseAtk: 2, atkPerFloor: 1 },
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

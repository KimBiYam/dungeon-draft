import { MonsterTypeCatalog, scaleMonsterStats } from './monsterTypes'

export type Pos = { x: number; y: number }
export type Enemy = {
  id: string
  pos: Pos
  hp: number
  maxHp: number
  atk: number
  monsterTypeId: string
  monsterName: string
  monsterTint: number
}
export type TrapKind = 'spike' | 'flame' | 'venom'
export type TrapTile = {
  pos: Pos
  kind: TrapKind
}
export type ChestRarity = 'common' | 'rare'
export type ChestTile = {
  pos: Pos
  rarity: ChestRarity
}
export type FloorData = {
  width: number
  height: number
  walls: Set<string>
  enemies: Enemy[]
  potions: Pos[]
  traps: TrapTile[]
  chests: ChestTile[]
  exit: Pos
}
export type RunState = {
  heroClass: HeroClassId
  floor: number
  turn: number
  hp: number
  maxHp: number
  atk: number
  def: number
  level: number
  xp: number
  nextXp: number
  player: Pos
  floorData: FloorData
  gameOver: boolean
}

export type HudState = {
  heroClass: HeroClassId
  floor: number
  hp: number
  maxHp: number
  atk: number
  def: number
  level: number
  xp: number
  nextXp: number
  enemiesLeft: number
  gameOver: boolean
}

export const MIN_MAP_W = 12
export const MAX_MAP_W = 20
export const MIN_MAP_H = 8
export const MAX_MAP_H = 14
export const TILE = 48
export const START_POS = { x: 1, y: 1 }

export type HeroClassId = 'knight' | 'berserker' | 'ranger'

export type HeroClassDefinition = {
  id: HeroClassId
  name: string
  description: string
  baseHp: number
  baseAtk: number
  baseDef: number
}

export const HERO_CLASSES: HeroClassDefinition[] = [
  {
    id: 'knight',
    name: 'Knight',
    description: 'Balanced frontline fighter with high durability.',
    baseHp: 36,
    baseAtk: 6,
    baseDef: 2,
  },
  {
    id: 'berserker',
    name: 'Berserker',
    description: 'High damage bruiser with lower defense.',
    baseHp: 32,
    baseAtk: 9,
    baseDef: 0,
  },
  {
    id: 'ranger',
    name: 'Ranger',
    description: 'Agile skirmisher with precise attacks.',
    baseHp: 28,
    baseAtk: 8,
    baseDef: 1,
  },
]

export function getHeroClassDefinition(heroClass: HeroClassId) {
  return HERO_CLASSES.find((entry) => entry.id === heroClass) ?? HERO_CLASSES[0]
}

export function keyOf(pos: Pos) {
  return `${pos.x},${pos.y}`
}

export function samePos(a: Pos, b: Pos) {
  return a.x === b.x && a.y === b.y
}

export function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function canReachTarget(
  width: number,
  height: number,
  walls: Set<string>,
  start: Pos,
  target: Pos,
) {
  const queue: Pos[] = [{ ...start }]
  const visited = new Set<string>([keyOf(start)])
  const deltas = [
    { x: 1, y: 0 },
    { x: -1, y: 0 },
    { x: 0, y: 1 },
    { x: 0, y: -1 },
  ]

  while (queue.length > 0) {
    const current = queue.shift()
    if (!current) continue
    if (samePos(current, target)) return true

    for (const delta of deltas) {
      const next = { x: current.x + delta.x, y: current.y + delta.y }
      if (next.x < 0 || next.y < 0 || next.x >= width || next.y >= height) {
        continue
      }
      const nextKey = keyOf(next)
      if (walls.has(nextKey) || visited.has(nextKey)) {
        continue
      }
      visited.add(nextKey)
      queue.push(next)
    }
  }

  return false
}

function carveGuaranteedPath(walls: Set<string>, start: Pos, target: Pos) {
  let x = start.x
  let y = start.y
  walls.delete(keyOf(start))
  while (x !== target.x) {
    x += target.x > x ? 1 : -1
    walls.delete(keyOf({ x, y }))
  }
  while (y !== target.y) {
    y += target.y > y ? 1 : -1
    walls.delete(keyOf({ x, y }))
  }
}

function createFloorOnce(floor: number): FloorData {
  const width = randomInt(MIN_MAP_W, MAX_MAP_W)
  const height = randomInt(MIN_MAP_H, MAX_MAP_H)
  const monsterCatalog = new MonsterTypeCatalog()
  const monsterTypes = monsterCatalog.list()
  const walls = new Set<string>()
  const blocked = new Set<string>([keyOf(START_POS)])

  for (let x = 0; x < width; x++) {
    walls.add(keyOf({ x, y: 0 }))
    walls.add(keyOf({ x, y: height - 1 }))
  }
  for (let y = 0; y < height; y++) {
    walls.add(keyOf({ x: 0, y }))
    walls.add(keyOf({ x: width - 1, y }))
  }

  for (let i = 0; i < 12 + floor; i++) {
    const pos = { x: randomInt(1, width - 2), y: randomInt(1, height - 2) }
    if ((pos.x <= 2 && pos.y <= 2) || (pos.x >= width - 3 && pos.y >= height - 3)) {
      continue
    }
    walls.add(keyOf(pos))
  }

  const findFree = () => {
    while (true) {
      const pos = { x: randomInt(1, width - 2), y: randomInt(1, height - 2) }
      const key = keyOf(pos)
      if (!walls.has(key) && !blocked.has(key)) {
        blocked.add(key)
        return pos
      }
    }
  }

  const enemies: Enemy[] = Array.from({ length: 3 + Math.ceil(floor / 2) }, (_, idx) => {
    const monsterType = monsterTypes[randomInt(0, monsterTypes.length - 1)]
    const scaled = scaleMonsterStats(monsterType, floor)
    const hp = scaled.maxHp + randomInt(0, 3)
    return {
      id: `f${floor}-e${idx}`,
      pos: findFree(),
      hp,
      maxHp: hp,
      atk: scaled.atk,
      monsterTypeId: monsterType.id,
      monsterName: monsterType.name,
      monsterTint: monsterType.tint,
    }
  })

  const potions: Pos[] = Array.from({ length: 2 + Math.floor(floor / 2) }, findFree)
  const traps: TrapTile[] = Array.from(
    { length: 2 + Math.floor(floor / 2) },
    () => ({
      pos: findFree(),
      kind: ['spike', 'flame', 'venom'][randomInt(0, 2)] as TrapKind,
    }),
  )
  const chests: ChestTile[] = Array.from(
    { length: 1 + Math.floor(floor / 3) },
    () => ({
      pos: findFree(),
      rarity: randomInt(1, 100) <= 25 ? 'rare' : 'common',
    }),
  )
  const exit = findFree()

  return { width, height, walls, enemies, potions, traps, chests, exit }
}

export function createFloor(floor: number): FloorData {
  for (let attempt = 0; attempt < 64; attempt++) {
    const candidate = createFloorOnce(floor)
    if (
      canReachTarget(
        candidate.width,
        candidate.height,
        candidate.walls,
        START_POS,
        candidate.exit,
      )
    ) {
      return candidate
    }
  }

  const fallback = createFloorOnce(floor)
  carveGuaranteedPath(fallback.walls, START_POS, fallback.exit)
  return fallback
}

export function createInitialRun(heroClass: HeroClassId = 'knight'): RunState {
  const heroDefinition = getHeroClassDefinition(heroClass)
  return {
    heroClass,
    floor: 1,
    turn: 0,
    hp: heroDefinition.baseHp,
    maxHp: heroDefinition.baseHp,
    atk: heroDefinition.baseAtk,
    def: heroDefinition.baseDef,
    level: 1,
    xp: 0,
    nextXp: 16,
    player: { ...START_POS },
    floorData: createFloor(1),
    gameOver: false,
  }
}

export function toHud(run: RunState): HudState {
  return {
    heroClass: run.heroClass,
    floor: run.floor,
    hp: run.hp,
    maxHp: run.maxHp,
    atk: run.atk,
    def: run.def,
    level: run.level,
    xp: run.xp,
    nextXp: run.nextXp,
    enemiesLeft: run.floorData.enemies.length,
    gameOver: run.gameOver,
  }
}

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

export function createFloor(floor: number): FloorData {
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

export function createInitialRun(): RunState {
  return {
    floor: 1,
    turn: 0,
    hp: 32,
    maxHp: 32,
    atk: 7,
    def: 1,
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

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
export type FloorData = {
  walls: Set<string>
  enemies: Enemy[]
  potions: Pos[]
  goldPiles: Pos[]
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
  gold: number
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
  gold: number
  enemiesLeft: number
  gameOver: boolean
}

export const MAP_W = 16
export const MAP_H = 10
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
  const monsterCatalog = new MonsterTypeCatalog()
  const monsterTypes = monsterCatalog.list()
  const walls = new Set<string>()
  const blocked = new Set<string>([keyOf(START_POS)])

  for (let x = 0; x < MAP_W; x++) {
    walls.add(keyOf({ x, y: 0 }))
    walls.add(keyOf({ x, y: MAP_H - 1 }))
  }
  for (let y = 0; y < MAP_H; y++) {
    walls.add(keyOf({ x: 0, y }))
    walls.add(keyOf({ x: MAP_W - 1, y }))
  }

  for (let i = 0; i < 12 + floor; i++) {
    const pos = { x: randomInt(1, MAP_W - 2), y: randomInt(1, MAP_H - 2) }
    if ((pos.x <= 2 && pos.y <= 2) || (pos.x >= MAP_W - 3 && pos.y >= MAP_H - 3)) {
      continue
    }
    walls.add(keyOf(pos))
  }

  const findFree = () => {
    while (true) {
      const pos = { x: randomInt(1, MAP_W - 2), y: randomInt(1, MAP_H - 2) }
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
  const goldPiles: Pos[] = Array.from({ length: 3 + floor }, findFree)
  const exit = findFree()

  return { walls, enemies, potions, goldPiles, exit }
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
    gold: 0,
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
    gold: run.gold,
    enemiesLeft: run.floorData.enemies.length,
    gameOver: run.gameOver,
  }
}

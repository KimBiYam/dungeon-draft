import type { Pos } from './model'

const KEY_TO_MOVE: Record<string, Pos> = {
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
  w: { x: 0, y: -1 },
  a: { x: -1, y: 0 },
  s: { x: 0, y: 1 },
  d: { x: 1, y: 0 },
  ' ': { x: 0, y: 0 },
}

export class InputMapper {
  resolveMoveFromKey(key: string): Pos | null {
    return KEY_TO_MOVE[key] ?? null
  }
}

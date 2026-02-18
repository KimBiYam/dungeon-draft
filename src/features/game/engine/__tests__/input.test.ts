import { describe, expect, it } from 'vitest'

import { InputMapper } from '../input'

describe('resolveMoveFromKey', () => {
  const inputMapper = new InputMapper()

  it('maps arrow keys to movement deltas', () => {
    expect(inputMapper.resolveMoveFromKey('ArrowUp')).toEqual({ x: 0, y: -1 })
    expect(inputMapper.resolveMoveFromKey('ArrowDown')).toEqual({ x: 0, y: 1 })
    expect(inputMapper.resolveMoveFromKey('ArrowLeft')).toEqual({ x: -1, y: 0 })
    expect(inputMapper.resolveMoveFromKey('ArrowRight')).toEqual({ x: 1, y: 0 })
  })

  it('maps wasd keys to movement deltas', () => {
    expect(inputMapper.resolveMoveFromKey('w')).toEqual({ x: 0, y: -1 })
    expect(inputMapper.resolveMoveFromKey('a')).toEqual({ x: -1, y: 0 })
    expect(inputMapper.resolveMoveFromKey('s')).toEqual({ x: 0, y: 1 })
    expect(inputMapper.resolveMoveFromKey('d')).toEqual({ x: 1, y: 0 })
  })

  it('maps space key to wait action', () => {
    expect(inputMapper.resolveMoveFromKey(' ')).toEqual({ x: 0, y: 0 })
  })

  it('returns null for unsupported keys', () => {
    expect(inputMapper.resolveMoveFromKey('Enter')).toBeNull()
    expect(inputMapper.resolveMoveFromKey('q')).toBeNull()
  })
})

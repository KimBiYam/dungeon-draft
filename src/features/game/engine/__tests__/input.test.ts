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

  it('maps korean 2-set layout keys to movement deltas', () => {
    expect(inputMapper.resolveMoveFromKey('ㅈ')).toEqual({ x: 0, y: -1 })
    expect(inputMapper.resolveMoveFromKey('ㅁ')).toEqual({ x: -1, y: 0 })
    expect(inputMapper.resolveMoveFromKey('ㄴ')).toEqual({ x: 0, y: 1 })
    expect(inputMapper.resolveMoveFromKey('ㅇ')).toEqual({ x: 1, y: 0 })
  })

  it('maps space key to wait action', () => {
    expect(inputMapper.resolveMoveFromKey(' ')).toEqual({ x: 0, y: 0 })
  })

  it('returns null for unsupported keys', () => {
    expect(inputMapper.resolveMoveFromKey('Enter')).toBeNull()
    expect(inputMapper.resolveMoveFromKey('q')).toBeNull()
  })

  it('resolves move command from key', () => {
    expect(inputMapper.resolveCommand('w')).toEqual({
      type: 'move',
      move: { x: 0, y: -1 },
    })
  })

  it('returns null command for unsupported key', () => {
    expect(inputMapper.resolveCommand('q')).toBeNull()
  })

  it('maps level-up card keys to 0-based choice indexes', () => {
    expect(inputMapper.resolveLevelUpChoiceIndex('1', 'Digit1')).toBe(0)
    expect(inputMapper.resolveLevelUpChoiceIndex('2', 'Digit2')).toBe(1)
    expect(inputMapper.resolveLevelUpChoiceIndex('3', 'Digit3')).toBe(2)
    expect(inputMapper.resolveLevelUpChoiceIndex('1', 'Numpad1')).toBe(0)
  })

  it('returns null for non card-select keys', () => {
    expect(inputMapper.resolveLevelUpChoiceIndex('w', 'KeyW')).toBeNull()
    expect(inputMapper.resolveLevelUpChoiceIndex('4', 'Digit4')).toBeNull()
  })
})

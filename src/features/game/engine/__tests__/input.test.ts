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

  it('resolves upgrade commands from physical key codes', () => {
    expect(inputMapper.resolveCommand('q', 'KeyQ')).toEqual({ type: 'upgradeWeapon' })
    expect(inputMapper.resolveCommand('ㅂ', 'KeyQ')).toEqual({ type: 'upgradeWeapon' })
    expect(inputMapper.resolveCommand('e', 'KeyE')).toEqual({ type: 'upgradeArmor' })
    expect(inputMapper.resolveCommand('ㄷ', 'KeyE')).toEqual({ type: 'upgradeArmor' })
  })

  it('resolves move command when upgrade code is not used', () => {
    expect(inputMapper.resolveCommand('w', 'KeyW')).toEqual({
      type: 'move',
      move: { x: 0, y: -1 },
    })
  })
})

import { describe, expect, it, vi } from 'vitest'

import { SceneInputController } from '../sceneInputController'

function createKeyboardEvent(overrides: Partial<KeyboardEvent> = {}): KeyboardEvent {
  const event = {
    key: 'ArrowRight',
    code: 'ArrowRight',
    repeat: false,
    preventDefault: vi.fn(),
    ...overrides,
  }
  return event as KeyboardEvent
}

describe('scene input controller', () => {
  it('dispatches level-up choice selection from numeric key', () => {
    const mapper = {
      resolveLevelUpChoiceIndex: vi.fn(() => 0),
      resolveCommand: vi.fn(() => null),
    }
    const chooseLevelUpReward = vi.fn()
    const controller = new SceneInputController(mapper as never, {
      getLevelUpChoices: () => [{ id: 'choice-a' }],
      getFloorEventChoices: () => null,
      isUiInputBlocked: () => false,
      chooseLevelUpReward,
      chooseFloorEventOption: vi.fn(),
      processTurn: vi.fn(),
    })

    const event = createKeyboardEvent({ key: '1', code: 'Digit1' })
    controller.handleKeyDown(event)

    expect(chooseLevelUpReward).toHaveBeenCalledWith('choice-a')
    expect(event.preventDefault).toHaveBeenCalled()
  })

  it('dispatches floor event selection when level-up modal is inactive', () => {
    const mapper = {
      resolveLevelUpChoiceIndex: vi.fn(() => 1),
      resolveCommand: vi.fn(() => null),
    }
    const chooseFloorEventOption = vi.fn()
    const controller = new SceneInputController(mapper as never, {
      getLevelUpChoices: () => null,
      getFloorEventChoices: () => [{ id: 'a' }, { id: 'event-b' }],
      isUiInputBlocked: () => false,
      chooseLevelUpReward: vi.fn(),
      chooseFloorEventOption,
      processTurn: vi.fn(),
    })

    controller.handleKeyDown(createKeyboardEvent({ key: '2', code: 'Digit2' }))

    expect(chooseFloorEventOption).toHaveBeenCalledWith('event-b')
  })

  it('processes movement when ui is not blocked and no modal is open', () => {
    const mapper = {
      resolveLevelUpChoiceIndex: vi.fn(() => null),
      resolveCommand: vi.fn(() => ({ move: { x: 1, y: 0 } })),
    }
    const processTurn = vi.fn()
    const controller = new SceneInputController(mapper as never, {
      getLevelUpChoices: () => null,
      getFloorEventChoices: () => null,
      isUiInputBlocked: () => false,
      chooseLevelUpReward: vi.fn(),
      chooseFloorEventOption: vi.fn(),
      processTurn,
    })

    controller.handleKeyDown(createKeyboardEvent({ key: 'd', code: 'KeyD' }))

    expect(processTurn).toHaveBeenCalledWith(1, 0)
  })

  it('does not process movement while ui input is blocked', () => {
    const mapper = {
      resolveLevelUpChoiceIndex: vi.fn(() => null),
      resolveCommand: vi.fn(() => ({ move: { x: 0, y: 1 } })),
    }
    const processTurn = vi.fn()
    const controller = new SceneInputController(mapper as never, {
      getLevelUpChoices: () => null,
      getFloorEventChoices: () => null,
      isUiInputBlocked: () => true,
      chooseLevelUpReward: vi.fn(),
      chooseFloorEventOption: vi.fn(),
      processTurn,
    })

    controller.handleKeyDown(createKeyboardEvent({ key: 's', code: 'KeyS' }))

    expect(processTurn).not.toHaveBeenCalled()
  })
})

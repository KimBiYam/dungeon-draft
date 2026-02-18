import { create } from 'zustand'

import { createAudioStore } from './audioStore'
import { createRuntimeStore } from './runtimeStore'
import { createSessionStore } from './sessionStore'
import type { GameUiStore } from './types'
import { createUiStore } from './uiStore'

export const useGameUiStore = create<GameUiStore>()((...args) => ({
  ...createSessionStore(...args),
  ...createAudioStore(...args),
  ...createUiStore(...args),
  ...createRuntimeStore(...args),
}))

export type { GameUiStore } from './types'

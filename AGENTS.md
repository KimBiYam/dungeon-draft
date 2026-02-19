# AGENTS Guide

## Project Layout (FSD-style)
- `src/features/game/engine`: Phaser game engine and domain logic
- `src/features/game/components`: Game-specific UI components
- `src/features/game/hooks`: Game-specific React hooks
- `src/shared/ui`: Shared UI components across features
- `src/widgets`: Feature composition layer
- `src/pages`: Route-level page components
- `src/routes`: TanStack file-based route entries (keep these thin)

## Current Game Architecture
- Entry point: `src/features/game/engine/createRoguelikeGame.ts`
- Scene factory: `src/features/game/engine/createDungeonSceneFactory.ts`
- Rendering system: `src/features/game/engine/dungeonVisualSystem.ts`
- Role services:
  - `src/features/game/engine/hero.ts`
  - `src/features/game/engine/monster.ts`
  - `src/features/game/engine/input.ts`

## Refactoring Direction (SOLID)
- Keep `createDungeonSceneFactory.ts` as an orchestration layer only.
- Move domain decisions/state transitions into dedicated services/classes.
- Move rendering sub-responsibilities out of `dungeonVisualSystem.ts` into focused renderers/registries.
- Prefer composition over large scene classes; wire dependencies in scene constructor/fields.

### Current split modules (engine)
- Turn and lifecycle:
  - `src/features/game/engine/turnResolver.ts`
  - `src/features/game/engine/playerMoveResolver.ts`
  - `src/features/game/engine/enemyPhaseResolver.ts`
  - `src/features/game/engine/runLifecycleService.ts`
- Progression and events:
  - `src/features/game/engine/levelUpFlow.ts`
  - `src/features/game/engine/floorEventFlow.ts`
  - `src/features/game/engine/floorEvent.ts`
  - `src/features/game/engine/lootService.ts`
- Scene wiring/helpers:
  - `src/features/game/engine/sceneInputController.ts`
  - `src/features/game/engine/runNotifier.ts`
  - `src/features/game/engine/sceneEffects.ts`
- Rendering split:
  - `src/features/game/engine/dungeonVisualSystem.ts`
  - `src/features/game/engine/dungeonObjectVisualFactory.ts`
  - `src/features/game/engine/enemyVisualRegistry.ts`
  - `src/features/game/engine/fogOfWarRenderer.ts`

### Rules for future changes
- If a file exceeds ~350 lines with mixed concerns, split by responsibility before adding features.
- New gameplay mechanics should add/extend a service first, then connect from scene factory.
- Add or update focused unit tests for newly extracted modules under `src/features/game/engine/__tests__`.
- Commit by logical unit (one responsibility change per commit).

## Testing Rules
- Prefer TDD for gameplay/domain logic:
  1. Add/update tests first
  2. Confirm failing test
  3. Implement/refactor
  4. Re-run tests and type-check
- Keep tests under `__tests__` per directory.
- Current engine tests:
  - `src/features/game/engine/__tests__/hero.test.ts`
  - `src/features/game/engine/__tests__/monster.test.ts`
  - `src/features/game/engine/__tests__/input.test.ts`

## Commands
- Use Node from `.nvmrc`:
  - `source ~/.nvm/nvm.sh && nvm use 22.14.0`
- Validation commands:
  - `pnpm exec tsc --noEmit`
  - `pnpm test -- --runInBand`
  - `pnpm build`

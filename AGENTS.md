# AGENTS Guide

## Project Layout (FSD-style)
- `src/features/core`: Core gameplay, scene orchestration, and shared game stores/UI
- `src/features/audio`: Audio engine/store/components
- `src/features/level`: Level-up and floor-event domain/components
- `src/shared/ui`: Shared UI components across features
- `src/widgets`: Feature composition layer
- `src/pages`: Route-level page components
- `src/routes`: TanStack file-based route entries (keep these thin)

## Current Game Architecture
- Entry point: `src/features/core/engine/createRoguelikeGame.ts`
- Scene factory: `src/features/core/engine/createDungeonSceneFactory.ts`
- Rendering system: `src/features/core/engine/dungeonVisualSystem.ts`
- Role services:
  - `src/features/core/engine/hero.ts`
  - `src/features/core/engine/monster.ts`
  - `src/features/core/engine/input.ts`

## Refactoring Direction (SOLID)
- Keep `createDungeonSceneFactory.ts` as an orchestration layer only.
- Move domain decisions/state transitions into dedicated services/classes.
- Move rendering sub-responsibilities out of `dungeonVisualSystem.ts` into focused renderers/registries.
- Prefer composition over large scene classes; wire dependencies in scene constructor/fields.

### Current split modules (engine)
- Turn and lifecycle:
  - `src/features/core/engine/turnResolver.ts`
  - `src/features/core/engine/playerMoveResolver.ts`
  - `src/features/core/engine/enemyPhaseResolver.ts`
  - `src/features/core/engine/runLifecycleService.ts`
- Progression and events:
  - `src/features/level/engine/levelUpFlow.ts`
  - `src/features/level/engine/floorEventFlow.ts`
  - `src/features/level/engine/floorEvent.ts`
  - `src/features/core/engine/lootService.ts`
- Scene wiring/helpers:
  - `src/features/core/engine/sceneInputController.ts`
  - `src/features/core/engine/runNotifier.ts`
  - `src/features/core/engine/sceneEffects.ts`
- Rendering split:
  - `src/features/core/engine/dungeonVisualSystem.ts`
  - `src/features/core/engine/dungeonObjectVisualFactory.ts`
  - `src/features/core/engine/enemyVisualRegistry.ts`
  - `src/features/core/engine/fogOfWarRenderer.ts`

### Rules for future changes
- If a file exceeds ~350 lines with mixed concerns, split by responsibility before adding features.
- New gameplay mechanics should add/extend a service first, then connect from scene factory.
- Add or update focused unit tests for newly extracted modules under `src/features/core/engine/__tests__`, `src/features/level/__tests__`, or `src/features/audio/__tests__`.
- Commit by logical unit (one responsibility change per commit).

## Testing Rules
- Prefer TDD for gameplay/domain logic:
  1. Add/update tests first
  2. Confirm failing test
  3. Implement/refactor
  4. Re-run tests and type-check
- Keep tests under `__tests__` per directory.
- Current engine tests:
  - `src/features/core/engine/__tests__/hero.test.ts`
  - `src/features/core/engine/__tests__/monster.test.ts`
  - `src/features/core/engine/__tests__/input.test.ts`

## Commands
- Use Node from `.nvmrc`:
  - `source ~/.nvm/nvm.sh && nvm use 22.14.0`
- Validation commands:
  - `pnpm exec tsc --noEmit`
  - `pnpm test -- --runInBand`
  - `pnpm build`

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

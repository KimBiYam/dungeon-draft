# Dungeon Draft

Phaser + React(TanStack Start) 기반의 로그라이크 게임입니다.
던전을 내려가며 전투하고, 레벨업 때마다 3개의 랜덤 카드 중 하나를 선택해 빌드를 성장시키는 구조입니다.

## Core Gameplay

- Grid-based turn combat
- Multi-floor dungeon progression
- Level-up draft system (pick 1 of 3 cards)
- Random traps (spike / flame / venom) that trigger on step
- Random treasure chests (common / rare) with dynamic rewards
- Hero/monster sprite animations with HP bars
- Limited vision (fog-of-war)
- In-game SFX with mute/volume control

## Controls

- Move: `WASD` / `Arrow Keys`
- Wait: `Space`
- Level-up card select: `1 / 2 / 3` (or `NumPad 1 / 2 / 3`)

## Tech Stack

- TanStack Start + React 19
- Phaser 3
- TypeScript
- Tailwind CSS
- Vitest

## Development

```bash
pnpm install
pnpm dev
```

## Build

```bash
pnpm build
```

## Test

```bash
pnpm test
```

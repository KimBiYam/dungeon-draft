# Dungeon Draft

Dungeon Draft is a roguelike built with Phaser and React (TanStack Start).
Fight your way down through dungeon floors and grow your build by choosing 1 of 3 random cards every time you level up.

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

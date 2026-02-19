import { clamp, type FloorEventKind, type RunState } from './model'

type Roll = (min: number, max: number) => number

export type FloorEventChoice = {
  id: string
  title: string
  description: string
}

type FloorEventOption = FloorEventChoice & {
  apply: (run: RunState, roll: Roll) => string
}

const FLOOR_EVENT_OPTIONS: Record<FloorEventKind, FloorEventOption[]> = {
  shop: [
    {
      id: 'shop-harden',
      title: 'Hardened Armor',
      description: 'DEF +1 and Max HP +4',
      apply: (run) => {
        run.def += 1
        run.maxHp += 4
        run.hp = clamp(run.hp + 4, 0, run.maxHp)
        return 'Merchant reforges your gear. DEF +1, Max HP +4.'
      },
    },
    {
      id: 'shop-sharpen',
      title: 'Sharpened Edge',
      description: 'ATK +2, take 4 damage',
      apply: (run) => {
        run.atk += 2
        run.hp = clamp(run.hp - 4, 0, run.maxHp)
        return 'You trade blood for steel. ATK +2, took 4 damage.'
      },
    },
    {
      id: 'shop-supplies',
      title: 'Emergency Supplies',
      description: 'Heal 10 HP',
      apply: (run) => {
        run.hp = clamp(run.hp + 10, 0, run.maxHp)
        return 'You stock up and recover 10 HP.'
      },
    },
  ],
  altar: [
    {
      id: 'altar-blood',
      title: 'Blood Offering',
      description: 'Lose 20% Max HP, gain ATK +3',
      apply: (run) => {
        const damage = Math.max(4, Math.floor(run.maxHp * 0.2))
        run.hp = clamp(run.hp - damage, 0, run.maxHp)
        run.atk += 3
        return `The altar answers. ATK +3, lost ${damage} HP.`
      },
    },
    {
      id: 'altar-ward',
      title: 'Sacred Ward',
      description: 'DEF +2 and heal 6',
      apply: (run) => {
        run.def += 2
        run.hp = clamp(run.hp + 6, 0, run.maxHp)
        return 'A pale shield surrounds you. DEF +2, healed 6 HP.'
      },
    },
    {
      id: 'altar-memory',
      title: 'Memory Tribute',
      description: 'Gain XP +14',
      apply: (run) => {
        run.xp += 14
        return 'You offer memory and gain 14 XP.'
      },
    },
  ],
  gamble: [
    {
      id: 'gamble-dice',
      title: 'Loaded Dice',
      description: '50%: ATK +3, else take 8 damage',
      apply: (run, roll) => {
        if (roll(0, 1) === 1) {
          run.atk += 3
          return 'Dice favor you. ATK +3.'
        }
        run.hp = clamp(run.hp - 8, 0, run.maxHp)
        return 'Dice betray you. You take 8 damage.'
      },
    },
    {
      id: 'gamble-cache',
      title: 'Hidden Cache',
      description: '50%: Max HP +6 and heal 6, else no gain',
      apply: (run, roll) => {
        if (roll(0, 1) === 1) {
          run.maxHp += 6
          run.hp = clamp(run.hp + 6, 0, run.maxHp)
          return 'Cache discovered. Max HP +6 and heal 6.'
        }
        return 'The cache was empty.'
      },
    },
    {
      id: 'gamble-leave',
      title: 'Walk Away',
      description: 'Leave safely',
      apply: () => 'You decide not to gamble.',
    },
  ],
}

export class FloorEventService {
  constructor(private readonly roll: Roll) {}

  createChoices(kind: FloorEventKind): FloorEventChoice[] {
    return FLOOR_EVENT_OPTIONS[kind].map((entry) => ({
      id: entry.id,
      title: entry.title,
      description: entry.description,
    }))
  }

  applyChoice(run: RunState, kind: FloorEventKind, choiceId: string) {
    const option = FLOOR_EVENT_OPTIONS[kind].find((entry) => entry.id === choiceId)
    if (!option) {
      return null
    }

    return option.apply(run, this.roll)
  }
}

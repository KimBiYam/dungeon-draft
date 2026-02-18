import { clamp, type RunState } from './model'

type Roll = (min: number, max: number) => number

type RewardDefinition = {
  id: string
  title: string
  description: string
  apply: (run: RunState) => void
}

export type LevelUpChoice = Pick<RewardDefinition, 'id' | 'title' | 'description'>

const LEVEL_UP_REWARD_POOL: RewardDefinition[] = [
  {
    id: 'power-strike',
    title: 'Power Strike',
    description: 'ATK +2',
    apply: (run) => {
      run.atk += 2
    },
  },
  {
    id: 'iron-hide',
    title: 'Iron Hide',
    description: 'DEF +1',
    apply: (run) => {
      run.def += 1
    },
  },
  {
    id: 'vital-core',
    title: 'Vital Core',
    description: 'Max HP +8 and heal 8',
    apply: (run) => {
      run.maxHp += 8
      run.hp = clamp(run.hp + 8, 0, run.maxHp)
    },
  },
  {
    id: 'battle-heal',
    title: 'Battle Heal',
    description: 'Heal 40% Max HP',
    apply: (run) => {
      const heal = Math.max(6, Math.floor(run.maxHp * 0.4))
      run.hp = clamp(run.hp + heal, 0, run.maxHp)
    },
  },
  {
    id: 'adaptive-shell',
    title: 'Adaptive Shell',
    description: 'Max HP +4 and DEF +1',
    apply: (run) => {
      run.maxHp += 4
      run.def += 1
      run.hp = clamp(run.hp + 4, 0, run.maxHp)
    },
  },
  {
    id: 'xp-surge',
    title: 'XP Surge',
    description: 'Gain bonus XP +10',
    apply: (run) => {
      run.xp += 10
    },
  },
]

export class HeroRoleService {
  constructor(private readonly roll: Roll) {}

  calculateAttackDamage(heroAtk: number) {
    return this.roll(Math.max(1, heroAtk - 2), heroAtk + 3)
  }

  gainPendingLevelUps(run: RunState) {
    let gained = 0

    while (run.xp >= run.nextXp) {
      run.xp -= run.nextXp
      run.level += 1
      run.nextXp = Math.floor(run.nextXp * 1.32)
      gained += 1
    }

    return gained
  }

  createLevelUpChoices(count = 3): LevelUpChoice[] {
    const deck = [...LEVEL_UP_REWARD_POOL]
    const picks = Math.min(count, deck.length)
    const choices: LevelUpChoice[] = []

    for (let i = 0; i < picks; i++) {
      const idx = this.roll(0, deck.length - 1)
      const [picked] = deck.splice(idx, 1)
      choices.push({
        id: picked.id,
        title: picked.title,
        description: picked.description,
      })
    }

    return choices
  }

  applyLevelUpChoice(run: RunState, choiceId: string) {
    const reward = LEVEL_UP_REWARD_POOL.find((entry) => entry.id === choiceId)
    if (!reward) {
      return null
    }

    reward.apply(run)
    return `Card picked: ${reward.title} (${reward.description})`
  }
}

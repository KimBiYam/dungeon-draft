import { clamp, type HeroClassId, type RunState } from './model'

type Roll = (min: number, max: number) => number
type RewardTag = 'offense' | 'defense' | 'sustain' | 'xp' | 'risk'

type RewardDefinition = {
  id: string
  title: string
  description: string
  tags: RewardTag[]
  apply: (run: RunState) => void
}

export type LevelUpChoice = Pick<
  RewardDefinition,
  'id' | 'title' | 'description' | 'tags'
>

const LEVEL_UP_REWARD_POOL: RewardDefinition[] = [
  {
    id: 'power-strike',
    title: 'Power Strike',
    description: 'ATK +2',
    tags: ['offense'],
    apply: (run) => {
      run.atk += 2
    },
  },
  {
    id: 'iron-hide',
    title: 'Iron Hide',
    description: 'DEF +1',
    tags: ['defense'],
    apply: (run) => {
      run.def += 1
    },
  },
  {
    id: 'vital-core',
    title: 'Vital Core',
    description: 'Max HP +8 and heal 8',
    tags: ['sustain'],
    apply: (run) => {
      run.maxHp += 8
      run.hp = clamp(run.hp + 8, 0, run.maxHp)
    },
  },
  {
    id: 'battle-heal',
    title: 'Battle Heal',
    description: 'Heal 40% Max HP',
    tags: ['sustain'],
    apply: (run) => {
      const heal = Math.max(6, Math.floor(run.maxHp * 0.4))
      run.hp = clamp(run.hp + heal, 0, run.maxHp)
    },
  },
  {
    id: 'adaptive-shell',
    title: 'Adaptive Shell',
    description: 'Max HP +4 and DEF +1',
    tags: ['defense', 'sustain'],
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
    tags: ['xp'],
    apply: (run) => {
      run.xp += 10
    },
  },
]

const HERO_CLASS_REWARD_POOLS: Record<HeroClassId, RewardDefinition[]> = {
  knight: [
    {
      id: 'knight-bastion',
      title: 'Bastion',
      description: 'Max HP +6 and DEF +1',
      tags: ['defense', 'sustain'],
      apply: (run) => {
        run.maxHp += 6
        run.def += 1
        run.hp = clamp(run.hp + 6, 0, run.maxHp)
      },
    },
    {
      id: 'knight-vanguard',
      title: 'Vanguard',
      description: 'ATK +1 and DEF +1',
      tags: ['offense', 'defense'],
      apply: (run) => {
        run.atk += 1
        run.def += 1
      },
    },
    {
      id: 'knight-fortify',
      title: 'Fortify',
      description: 'Heal 30% Max HP and DEF +1',
      tags: ['defense', 'sustain'],
      apply: (run) => {
        run.def += 1
        const heal = Math.max(4, Math.floor(run.maxHp * 0.3))
        run.hp = clamp(run.hp + heal, 0, run.maxHp)
      },
    },
  ],
  berserker: [
    {
      id: 'berserker-rage',
      title: 'Blood Rage',
      description: 'ATK +3 and Max HP -2',
      tags: ['offense', 'risk'],
      apply: (run) => {
        run.atk += 3
        run.maxHp = Math.max(12, run.maxHp - 2)
        run.hp = clamp(run.hp, 0, run.maxHp)
      },
    },
    {
      id: 'berserker-thirst',
      title: 'Bloodthirst',
      description: 'ATK +2 and heal 5',
      tags: ['offense', 'sustain'],
      apply: (run) => {
        run.atk += 2
        run.hp = clamp(run.hp + 5, 0, run.maxHp)
      },
    },
    {
      id: 'berserker-cruel',
      title: 'Cruel Momentum',
      description: 'ATK +2 and DEF +1',
      tags: ['offense', 'defense'],
      apply: (run) => {
        run.atk += 2
        run.def += 1
      },
    },
  ],
  ranger: [
    {
      id: 'ranger-focus',
      title: 'Deadeye Focus',
      description: 'ATK +2 and XP +8',
      tags: ['offense', 'xp'],
      apply: (run) => {
        run.atk += 2
        run.xp += 8
      },
    },
    {
      id: 'ranger-footwork',
      title: 'Swift Footwork',
      description: 'DEF +1 and heal 25% Max HP',
      tags: ['defense', 'sustain'],
      apply: (run) => {
        run.def += 1
        const heal = Math.max(4, Math.floor(run.maxHp * 0.25))
        run.hp = clamp(run.hp + heal, 0, run.maxHp)
      },
    },
    {
      id: 'ranger-survival',
      title: 'Survival Instinct',
      description: 'Max HP +5 and ATK +1',
      tags: ['sustain', 'offense'],
      apply: (run) => {
        run.maxHp += 5
        run.atk += 1
        run.hp = clamp(run.hp + 5, 0, run.maxHp)
      },
    },
  ],
}

const TAG_WEIGHT_BONUS = 3

function pickWeightedReward(
  deck: RewardDefinition[],
  preferredTags: Set<RewardTag>,
  roll: Roll,
) {
  if (deck.length === 0) {
    return null
  }

  const weights = deck.map((entry) => {
    if (preferredTags.size === 0) {
      return 1
    }
    const matches = entry.tags.filter((tag) => preferredTags.has(tag)).length
    return 1 + matches * TAG_WEIGHT_BONUS
  })
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0)
  let target = roll(1, totalWeight)
  for (let i = 0; i < deck.length; i++) {
    target -= weights[i]
    if (target <= 0) {
      const [picked] = deck.splice(i, 1)
      return picked
    }
  }

  return deck.pop() ?? null
}

function pickRewardBatch(
  source: RewardDefinition[],
  count: number,
  preferredTags: Set<RewardTag>,
  roll: Roll,
) {
  const deck = [...source]
  const picks = Math.min(count, deck.length)
  const choices: RewardDefinition[] = []
  for (let i = 0; i < picks; i++) {
    const picked = pickWeightedReward(deck, preferredTags, roll)
    if (picked) {
      choices.push(picked)
    }
  }
  return choices
}

function splitChoiceCount(totalCount: number) {
  const classCount = Math.ceil(totalCount / 2)
  const commonCount = totalCount - classCount
  return { classCount, commonCount }
}

function toChoice(entry: RewardDefinition): LevelUpChoice {
  return {
    id: entry.id,
    title: entry.title,
    description: entry.description,
    tags: entry.tags,
  }
}

export class HeroRoleService {
  private readonly preferredTags = new Set<RewardTag>()

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

  createLevelUpChoices(heroClass: HeroClassId, count = 3): LevelUpChoice[] {
    const totalAvailable =
      LEVEL_UP_REWARD_POOL.length + HERO_CLASS_REWARD_POOLS[heroClass].length
    const totalPicks = Math.min(count, totalAvailable)
    const preferredTags = new Set(this.preferredTags)
    const { classCount, commonCount } = splitChoiceCount(totalPicks)
    const classChoices = pickRewardBatch(
      HERO_CLASS_REWARD_POOLS[heroClass],
      classCount,
      preferredTags,
      this.roll,
    )
    const commonChoices = pickRewardBatch(
      LEVEL_UP_REWARD_POOL,
      commonCount,
      preferredTags,
      this.roll,
    )
    const choices = [...classChoices, ...commonChoices]

    while (choices.length < totalPicks) {
      const missing =
        classChoices.length < HERO_CLASS_REWARD_POOLS[heroClass].length
          ? pickRewardBatch(
              HERO_CLASS_REWARD_POOLS[heroClass].filter(
                (entry) => !choices.some((picked) => picked.id === entry.id),
              ),
              1,
              preferredTags,
              this.roll,
            )
          : pickRewardBatch(
              LEVEL_UP_REWARD_POOL.filter(
                (entry) => !choices.some((picked) => picked.id === entry.id),
              ),
              1,
              preferredTags,
              this.roll,
            )
      if (missing.length === 0) {
        break
      }
      choices.push(missing[0])
    }

    return choices.map(toChoice)
  }

  resetBuildSynergy() {
    this.preferredTags.clear()
  }

  applyLevelUpChoice(run: RunState, choiceId: string, heroClass: HeroClassId) {
    const reward = [...LEVEL_UP_REWARD_POOL, ...HERO_CLASS_REWARD_POOLS[heroClass]].find(
      (entry) => entry.id === choiceId,
    )
    if (!reward) {
      return null
    }

    reward.apply(run)
    reward.tags.forEach((tag) => this.preferredTags.add(tag))
    return `Card picked: ${reward.title} (${reward.description})`
  }
}

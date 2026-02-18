import { memo } from 'react'

import type { LevelUpChoice } from '../engine/createRoguelikeGame'

type LevelUpChoiceModalProps = {
  choices: LevelUpChoice[] | null
  onPick: (choiceId: string) => void
}

function LevelUpChoiceModalImpl({ choices, onPick }: LevelUpChoiceModalProps) {
  if (!choices || choices.length === 0) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4">
      <section className="w-full max-w-3xl rounded-xl border border-zinc-700 bg-zinc-900 p-5">
        <h3 className="text-lg font-semibold text-cyan-200">Level Up Reward</h3>
        <p className="mt-2 text-sm text-zinc-300">Choose 1 card. (`1` / `2` / `3`)</p>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {choices.map((choice, index) => (
            <button
              key={choice.id}
              type="button"
              onClick={() => onPick(choice.id)}
              className="rounded-lg border border-cyan-300/30 bg-zinc-950/70 p-4 text-left transition hover:border-cyan-300/70 hover:bg-cyan-500/10"
            >
              <p className="text-xs text-cyan-300">{index + 1} (NumPad {index + 1})</p>
              <p className="mt-1 text-sm font-semibold text-cyan-100">{choice.title}</p>
              <p className="mt-2 text-xs text-zinc-300">{choice.description}</p>
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}

const areEqual = (prev: LevelUpChoiceModalProps, next: LevelUpChoiceModalProps) => {
  return prev.choices === next.choices && prev.onPick === next.onPick
}

export const LevelUpChoiceModal = memo(LevelUpChoiceModalImpl, areEqual)

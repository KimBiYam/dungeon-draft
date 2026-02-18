import { useCallback } from 'react'

import { useAudioStore } from '../store/audioStore'

export function AudioControls() {
  'use memo'

  const muted = useAudioStore((state) => state.audioMuted)
  const volume = useAudioStore((state) => state.audioVolume)
  const onToggleMuted = useAudioStore((state) => state.toggleAudioMuted)
  const onVolumeChange = useAudioStore((state) => state.setAudioVolumePercent)
  const handleVolumeChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onVolumeChange(Number(event.target.value))
    },
    [onVolumeChange],
  )

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onToggleMuted}
        className="rounded-md border border-cyan-300/40 px-3 py-1 text-xs font-semibold text-cyan-100 transition hover:bg-cyan-400/10"
      >
        {muted ? 'Unmute' : 'Mute'}
      </button>
      <label className="flex items-center gap-2 rounded-md border border-cyan-300/20 px-2 py-1 text-xs text-cyan-100">
        Vol
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={volume}
          onChange={handleVolumeChange}
          className="w-20 accent-cyan-300"
        />
        <span className="w-8 text-right tabular-nums">{volume}%</span>
      </label>
    </div>
  )
}

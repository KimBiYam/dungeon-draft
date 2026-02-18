export type SfxEvent =
  | 'runStart'
  | 'newRun'
  | 'heroAttack'
  | 'enemyHit'
  | 'enemyDefeat'
  | 'heroHit'
  | 'pickupPotion'
  | 'pickupGold'
  | 'descendFloor'
  | 'levelUp'
  | 'wallBlocked'
  | 'upgrade'
  | 'death'

export type SfxStep = {
  frequency: number
  duration: number
  volume: number
  wave: OscillatorType
}

const BASE_VOLUME = 0.05

export function createSfxPattern(event: SfxEvent): SfxStep[] {
  switch (event) {
    case 'runStart':
      return [
        { frequency: 360, duration: 0.05, volume: 0.8, wave: 'triangle' },
        { frequency: 520, duration: 0.08, volume: 1, wave: 'triangle' },
      ]
    case 'newRun':
      return [
        { frequency: 480, duration: 0.05, volume: 0.8, wave: 'square' },
        { frequency: 620, duration: 0.07, volume: 1, wave: 'square' },
      ]
    case 'heroAttack':
      return [
        { frequency: 320, duration: 0.035, volume: 0.9, wave: 'sawtooth' },
        { frequency: 240, duration: 0.045, volume: 0.7, wave: 'sawtooth' },
      ]
    case 'enemyHit':
      return [{ frequency: 220, duration: 0.05, volume: 0.9, wave: 'square' }]
    case 'enemyDefeat':
      return [
        { frequency: 260, duration: 0.04, volume: 0.8, wave: 'square' },
        { frequency: 390, duration: 0.05, volume: 0.9, wave: 'square' },
        { frequency: 520, duration: 0.06, volume: 1, wave: 'triangle' },
      ]
    case 'heroHit':
      return [
        { frequency: 180, duration: 0.06, volume: 1, wave: 'sawtooth' },
        { frequency: 130, duration: 0.06, volume: 0.9, wave: 'sawtooth' },
      ]
    case 'pickupPotion':
      return [
        { frequency: 620, duration: 0.04, volume: 0.8, wave: 'sine' },
        { frequency: 760, duration: 0.06, volume: 1, wave: 'sine' },
      ]
    case 'pickupGold':
      return [
        { frequency: 720, duration: 0.03, volume: 0.8, wave: 'triangle' },
        { frequency: 920, duration: 0.05, volume: 1, wave: 'triangle' },
      ]
    case 'descendFloor':
      return [
        { frequency: 520, duration: 0.05, volume: 0.8, wave: 'triangle' },
        { frequency: 390, duration: 0.06, volume: 0.9, wave: 'triangle' },
        { frequency: 620, duration: 0.08, volume: 1, wave: 'triangle' },
      ]
    case 'levelUp':
      return [
        { frequency: 520, duration: 0.04, volume: 0.8, wave: 'square' },
        { frequency: 620, duration: 0.04, volume: 0.9, wave: 'square' },
        { frequency: 780, duration: 0.06, volume: 1, wave: 'square' },
      ]
    case 'wallBlocked':
      return [{ frequency: 140, duration: 0.05, volume: 0.8, wave: 'square' }]
    case 'upgrade':
      return [
        { frequency: 460, duration: 0.04, volume: 0.8, wave: 'triangle' },
        { frequency: 580, duration: 0.05, volume: 0.9, wave: 'triangle' },
      ]
    case 'death':
      return [
        { frequency: 220, duration: 0.07, volume: 1, wave: 'sawtooth' },
        { frequency: 180, duration: 0.07, volume: 0.9, wave: 'sawtooth' },
        { frequency: 140, duration: 0.08, volume: 0.8, wave: 'sawtooth' },
        { frequency: 96, duration: 0.1, volume: 0.7, wave: 'sawtooth' },
      ]
    default:
      return []
  }
}

type AudioContextLike = {
  currentTime: number
  state: AudioContextState
  createOscillator: () => OscillatorNode
  createGain: () => GainNode
  resume: () => Promise<void>
  destination: AudioNode
}

export class RetroSfx {
  constructor(private readonly getContext: () => AudioContextLike | undefined) {}

  play(event: SfxEvent) {
    const context = this.getContext()
    if (!context) {
      return
    }

    if (context.state === 'suspended') {
      void context.resume().catch(() => undefined)
    }

    const pattern = createSfxPattern(event)
    let offset = 0

    for (const step of pattern) {
      this.scheduleStep(context, context.currentTime + offset, step)
      offset += step.duration
    }
  }

  private scheduleStep(context: AudioContextLike, startTime: number, step: SfxStep) {
    const oscillator = context.createOscillator()
    const gain = context.createGain()
    const endTime = startTime + step.duration

    oscillator.type = step.wave
    oscillator.frequency.setValueAtTime(step.frequency, startTime)

    const peak = Math.max(0.0001, step.volume * BASE_VOLUME)
    gain.gain.setValueAtTime(0.0001, startTime)
    gain.gain.exponentialRampToValueAtTime(peak, startTime + 0.01)
    gain.gain.exponentialRampToValueAtTime(0.0001, endTime)

    oscillator.connect(gain)
    gain.connect(context.destination)
    oscillator.start(startTime)
    oscillator.stop(endTime)
  }
}

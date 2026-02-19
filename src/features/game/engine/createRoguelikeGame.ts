import { MAX_MAP_H, MAX_MAP_W, TILE } from './model'
import {
  type CreateRoguelikeGameOptions,
  type RoguelikeGameApi,
} from './contracts'
import { createDungeonSceneFactory } from './createDungeonSceneFactory'

export type { LevelUpChoice } from './hero'
export type { FloorEventChoice } from './floorEvent'
export type { MetaProgress, MetaUpgradeId } from './meta'
export type { HeroClassId, HudState } from './model'
export type { RoguelikeGameApi } from './contracts'

export async function createRoguelikeGame(
  options: CreateRoguelikeGameOptions,
): Promise<RoguelikeGameApi> {
  const Phaser = await import('phaser')
  const DungeonScene = createDungeonSceneFactory(Phaser, options)
  const scene = new DungeonScene()

  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: options.mount,
    width: MAX_MAP_W * TILE,
    height: MAX_MAP_H * TILE,
    scene,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    backgroundColor: '#000000',
  })

  return {
    newRun: (heroClass) => scene.newRun(heroClass),
    chooseLevelUpReward: (choiceId: string) => scene.chooseLevelUpReward(choiceId),
    chooseFloorEventOption: (choiceId: string) => scene.chooseFloorEventOption(choiceId),
    setUiInputBlocked: (blocked: boolean) => scene.setUiInputBlocked(blocked),
    setAudioMuted: (muted: boolean) => scene.setAudioMuted(muted),
    setAudioVolume: (volume: number) => scene.setAudioVolume(volume),
    destroy: () => game.destroy(true),
  }
}

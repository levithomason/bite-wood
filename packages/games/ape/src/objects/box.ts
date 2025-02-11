import { GameImage, GameObject, GameSprite } from '@bite-wood/core'
import { sndBoxExplode } from '../sounds/sound-box-explode.js'

// =============================================================================
// Box
// =============================================================================

const imgBox = new GameImage('./sprites/box.png')
await imgBox.load()

const sprBox = new GameSprite(imgBox, {
  frameWidth: 8,
  frameHeight: 8,
  insertionX: 4,
  insertionY: 4,
  scaleX: 4,
  scaleY: 4,
  // TODO: this sound doesn't play when in the destroy event
  // events: {
  //   destroy: () => {
  //     sndBoxExplode.play()
  //   },
  // },
})

export class Box extends GameObject {
  constructor() {
    super({
      states: {
        idle: { name: 'idle' },
      },

      sprite: sprBox,
    })
  }

  // TODO: make this auto type other to GameObject
  onCollision(other: GameObject) {
    if (other.constructor.name === 'Banana') {
      sndBoxExplode.playOne()
    }
  }
}

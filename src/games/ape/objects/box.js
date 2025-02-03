import { GameImage, GameObject, GameSprite } from '../../../core/index.js'
import { sndBoxExplode } from '../sounds/sound-box-explode.js'

// =============================================================================
// Box
// =============================================================================

const imgBox = new GameImage('./sprites/box.png')
await imgBox.loaded

export class Box extends GameObject {
  constructor() {
    super({
      sprite: new GameSprite(imgBox, {
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
      }),
    })
  }

  onCollision(other) {
    if (other.constructor.name === 'Banana') {
      sndBoxExplode.playOne()
    }
  }
}

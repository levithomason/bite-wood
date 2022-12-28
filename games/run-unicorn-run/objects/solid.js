import * as collision from '../../../core/collision.js'
import {
  GameImage,
  GameObject,
  GameSprite,
  gameMouse,
  gameState,
} from '../../../core/index.js'

// ----------------------------------------
// Solid
// ----------------------------------------
const width = 60
const height = 60
const imgSolid = new GameImage()
const spriteConfig = {
  frameCount: 1,
  frameWidth: width,
  frameHeight: height,
  insertionX: width / 2,
  insertionY: height / 2,
}

const sprSolid = new GameSprite(imgSolid, spriteConfig)
const sprSolidColliding = new GameSprite(imgSolid, spriteConfig)

/**
 * TODO
 *   1) [X] Move sprite collision (and insertion?) config to GameObjec
 *      Why? Allows game objects to exist without sprites
 *      They should be allowed to have collisions without sprites.
 *   2) [ ] Test collision.js methods with new GameObject shape.
 *   3) [ ] Create GameObjectState for FSM management of object states
 *        - Add IDLE_LEFT, IDLE_RIGHT, etc to Player
 *        - Listen to correct keys on each state
 *        - Update sprite config on each state
 *          *this is also why sprite config can move to GameObject,
 *          states can manage changing sprite info.
 *        - It's possible that GameSprite merges entirely into GameObject.
 */

class Solid extends GameObject {
  static name = 'objSolid'

  constructor() {
    super({
      sprite: sprSolid,
    })

    this.x = 300
    this.y = 600 - Math.random() * height * 2
  }

  step() {
    super.step()

    if (!gameState.debug) {
      // TODO: introduce 'active' and .deactivate() to temp remove instances from the game
      this.moveTo(-999, -999)
      return
    }

    this.moveTo(gameMouse.x, gameMouse.y)

    if (collision.objects(this, 'any')) {
      this.setSprite(sprSolidColliding)
    } else {
      this.setSprite(sprSolid)
    }
  }
}

export default Solid

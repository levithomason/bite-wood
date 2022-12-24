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
const spriteConfig = {
  image: new GameImage(),
  frameCount: 1,
  frameWidth: width,
  frameHeight: height,
  insertionX: width / 2,
  insertionY: height / 2,
}

const sprSolid = new GameSprite(spriteConfig)

const sprSolidColliding = new GameSprite(spriteConfig)

class Solid extends GameObject {
  static name = 'objSolid'

  constructor() {
    super({
      sprite: sprSolid,
      maxSpeed: 0,
      acceleration: 0,
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

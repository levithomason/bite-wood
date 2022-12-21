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
const width = Math.round(Math.random() * 80) + 20
const height = Math.round(Math.random() * 80) + 20
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
  static displayName = 'objSolid'

  constructor({ x = 300, y = 600 - Math.random() * height * 2 }) {
    super({
      sprite: sprSolid,
      x: x,
      y: y,
      maxSpeed: 0,
      acceleration: 0,
      events: {
        step: {
          actions: [
            self => {
              if (!gameState.debug) {
                // TODO: introduce 'active' and .deactivate() to temp remove instances from the game
                self.moveTo(-999, -999)
                return
              }

              self.moveTo(gameMouse.x, gameMouse.y)

              if (collision.objects(self, 'any')) {
                self.setSprite(sprSolidColliding)
              } else {
                self.setSprite(sprSolid)
              }
            },
          ],
        },
      },
    })
  }
}

window.Solid = Solid

export default Solid

import * as collision from '../core/collision.js'
import { GameImage, GameObject, GameSprite } from '../core/game/index.js'
import state from '../core/state.js'

// ----------------------------------------
// Player
// ----------------------------------------
const width = Math.round(Math.random() * 80) + 20
const height = Math.round(Math.random() * 80) + 20
const spriteConfig = {
  frameCount: 1,
  frameWidth: width,
  frameHeight: height,
  insertionX: width / 2,
  insertionY: height / 2,
}
const sprSolid = new GameSprite({
  image: new GameImage(`https://placehold.it/${width}x${height}/444`),
  ...spriteConfig,
})

const sprSolidColliding = new GameSprite({
  image: new GameImage(`https://placehold.it/${width}x${height}/F00`),
  ...spriteConfig,
})

const objSolid = new GameObject({
  sprite: sprSolid,
  solid: true,
  x: 300,
  y: 600 - Math.random() * height * 2,
  maxSpeed: 0,
  acceleration: 0,
  gravity: 0,
  friction: 0,
  events: {
    step: {
      actions: [
        self => {
          if (!state.debug) {
            // TODO: introduce 'active' and .deactivate() to temp remove instances from the game
            self.moveTo(-999, -999)
            return
          }

          self.moveTo(state.mouse.x, state.mouse.y)

          if (collision.objects(self)) {
            self.setSprite(sprSolidColliding)
          } else {
            self.setSprite(sprSolid)
          }
        },
      ],
    },
  },
})

window.objSolid = objSolid

export default objSolid

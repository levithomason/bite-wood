import * as collision from './collision.js'
import { GameImage, GameObject, GameSprite } from './game.js'
import objPlayer from './player.js'

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
          self.moveTo(self.game.mouse.x, self.game.mouse.y)

          if (collision.objects(self, objPlayer)) {
            // TODO: stop the player, crude bounce for now
            objPlayer.direction += 180
            self.setSprite(sprSolidColliding)
          } else {
            self.setSprite(sprSolid)
          }
        },
      ],
    },
  },
})

export default objSolid

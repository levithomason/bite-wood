import * as collision from '../core/collision.js'
import * as utils from '../core/utils.js'
import {
  GameAudio,
  GameImage,
  GameObject,
  GameSprite,
} from '../core/game/index.js'
import state from '../core/state.js'

import Player from '../objects/player.js'

// ----------------------------------------
// Player
// ----------------------------------------
const sprApple = new GameSprite({
  image: new GameImage(`../images/apple.png`),
  scaleX: 2,
  scaleY: 2,
  frameCount: 1,
  frameWidth: 11,
  frameHeight: 12,
  insertionX: 5,
  insertionY: 12,
})

const sndEatApple = new GameAudio('../sounds/20269__koops__apple-crunch-06.wav')

class Apple extends GameObject {
  static displayName = 'objApple'

  constructor({ x, y }) {
    super({
      sprite: sprApple,
      x: x,
      y: y,
      speed: 0.2,
      direction: 180 + Math.random() * 180 - 90,
      events: {
        create: {
          actions: [
            self => {
              self.x = state.room.width * Math.random()
              self.y = state.room.height + Math.random() * 200
            },
          ],
        },

        step: {
          actions: [
            // bounce around a bit
            self => {
              const direction = utils.direction(
                self.x,
                self.y,
                self.startX,
                self.startY,
              )

              const speed =
                Math.pow(
                  utils.distance(self.x, self.y, self.startX, self.startY),
                  3,
                ) * 0.001

              self.motionAdd(direction, speed)
            },

            // die on collision with player
            self => {
              if (collision.objects(self, Player)) {
                sndEatApple.play()
                state.room.instanceDestroy(self)

                // go to next room on all apples collected
                if (!state.room.instanceExists(Apple)) {
                  state.nextRoom()
                }
              }
            },
          ],
        },
      },
    })
  }
}

window.Apple = Apple

export default Apple

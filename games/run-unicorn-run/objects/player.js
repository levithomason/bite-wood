import {
  GameImage,
  GameSprite,
  GameObject,
  gamePhysics,
  gameMouse,
  gameRooms,
  gameKeyboard,
} from '../../../core/index.js'

import * as utils from '../../../core/math.js'
import * as collision from '../../../core/collision.js'

// ----------------------------------------
// Player
// ----------------------------------------
const boundingBoxL = {
  boundingBoxTop: 5,
  boundingBoxLeft: 8,
  boundingBoxWidth: 28,
  boundingBoxHeight: 41,
}
const boundingBoxR = {
  boundingBoxTop: 5,
  boundingBoxLeft: 11,
  boundingBoxWidth: 28,
  boundingBoxHeight: 41,
}
export const imgPlayerR = new GameImage(
  '../run-unicorn-run/images/my-littlepony-right.png',
)
export const imgPlayerL = new GameImage(
  '../run-unicorn-run/images/my-littlepony-left.png',
)
export const sprPlayerIdleR = new GameSprite({
  image: imgPlayerR,
  frameCount: 16,
  frameWidth: 45,
  frameHeight: 46,
  offsetX: 0,
  offsetY: 543,
  scaleX: 2,
  scaleY: 2,
  insertionX: 24,
  insertionY: 46,
  stepsPerFrame: 8,
  ...boundingBoxR,
})
export const sprPlayerIdleL = new GameSprite({
  image: imgPlayerL,
  rtl: true,
  frameCount: 16,
  frameWidth: 45,
  frameHeight: 46,
  offsetX: 1106,
  offsetY: 543,
  scaleX: 2,
  scaleY: 2,
  insertionX: 24,
  insertionY: 46,
  stepsPerFrame: 8,
  ...boundingBoxL,
})
export const sprPlayerWalkR = new GameSprite({
  image: imgPlayerR,
  frameCount: 6,
  frameWidth: 48,
  frameHeight: 46,
  offsetX: 55,
  offsetY: 12,
  scaleX: 2,
  scaleY: 2,
  insertionX: 24,
  insertionY: 46,
  stepsPerFrame: 2,
  ...boundingBoxR,
})
export const sprPlayerWalkL = new GameSprite({
  image: imgPlayerL,
  rtl: true,
  frameCount: 6,
  frameWidth: 48,
  frameHeight: 46,
  offsetX: 1051,
  offsetY: 12,
  scaleX: 2,
  scaleY: 2,
  insertionX: 24,
  insertionY: 46,
  stepsPerFrame: 2,
  ...boundingBoxL,
})

class Player extends GameObject {
  static displayName = 'objPlayer'

  constructor({ x = 100, y = 573 }) {
    super({
      persist: true,
      sprite: sprPlayerIdleR,
      x: x,
      y: y,
      acceleration: 0.5,
      friction: gamePhysics.friction,
      gravity: gamePhysics.gravity.magnitude,
      gravityDirection: gamePhysics.gravity.direction,
      jump: 12,
      maxSpeed: 4,
      events: {
        step: {
          actions: [
            // add friction when on the ground
            self => {
              if (collision.onBottom(self, 'solid')) {
                self.friction = gamePhysics.friction
              } else {
                self.friction = 0
              }
            },

            // remove friction when walking
            self => {
              if (
                gameKeyboard.active.ArrowRight ||
                gameKeyboard.active.ArrowLeft
              ) {
                self.friction = 0
                self.hspeed =
                  Math.sign(self.hspeed) *
                  Math.min(Math.abs(self.hspeed), self.maxSpeed)
              }
            },
            // go to next/prev room on room edge
            self => {
              if (self.x >= gameRooms.currentRoom.width) {
                if (gameRooms.nextRoom()) {
                  self.x = self.hspeed
                }
              } else if (self.x <= 0) {
                if (gameRooms.prevRoom()) {
                  self.x = gameRooms.currentRoom.width + self.hspeed
                }
              }
            },
          ],
        },

        draw: {
          actions: [
            (self, drawing) => {
              if (gameMouse.down.left) {
                drawing.setLineWidth(2)
                drawing.setColor('#753')
                drawing.arrow(self.x, self.y, gameMouse.x, gameMouse.y)
              }
            },
          ],
        },

        mouseActive: {
          left: {
            actions: [
              self => {
                const speed =
                  utils.distance(self.x, self.y, gameMouse.x, gameMouse.y) / 500

                self.motionAdd(
                  utils.direction(self.x, self.y, gameMouse.x, gameMouse.y),
                  Math.min(1, speed),
                )
              },
            ],
          },
        },

        keyDown: {
          ArrowUp: {
            actions: [
              self => {
                if (collision.onBottom(self, 'solid')) {
                  self.motionAdd(gamePhysics.DIRECTION_UP, self.jump)
                }
              },
            ],
          },
        },

        keyUp: {
          ArrowRight: {
            actions: [
              self => {
                self.setSprite(sprPlayerIdleR)
              },
            ],
          },
          ArrowLeft: {
            actions: [
              self => {
                self.setSprite(sprPlayerIdleL)
              },
            ],
          },
        },

        keyActive: {
          ArrowRight: {
            actions: [
              self => {
                self.setSprite(sprPlayerWalkR)
                self.motionAdd(gamePhysics.DIRECTION_RIGHT, self.acceleration)
              },
            ],
          },

          ArrowLeft: {
            actions: [
              self => {
                self.setSprite(sprPlayerWalkL)
                self.motionAdd(gamePhysics.DIRECTION_LEFT, self.acceleration)
              },
            ],
          },
        },
      },
    })
  }
}

window.Player = Player

export default Player

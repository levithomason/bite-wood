import { GameImage, GameSprite, GameObject } from '../core/game/index.js'
import * as draw from '../core/draw.js'
import state from '../core/state.js'
import * as utils from '../core/utils.js'

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
export const imgPlayerR = new GameImage('../images/my-littlepony-right.png')
export const imgPlayerL = new GameImage('../images/my-littlepony-left.png')
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
      friction: state.physics.friction,
      gravity: state.physics.gravity.magnitude,
      gravityDirection: state.physics.gravity.direction,
      jump: 12,
      maxSpeed: 4,
      events: {
        step: {
          actions: [
            // add friction when on the ground
            self => {
              if (self.y >= state.room.height) {
                self.friction = state.physics.friction
              } else {
                self.friction = 0
              }
            },
            // remove friction when walking
            self => {
              if (
                state.keys.active.ArrowRight ||
                state.keys.active.ArrowLeft
              ) {
                self.friction = 0
                self.hspeed =
                  Math.sign(self.hspeed) *
                  Math.min(Math.abs(self.hspeed), self.maxSpeed)
              }
            },
            // go to next/prev room on room edge
            self => {
              if (self.x >= state.room.width) {
                if (state.nextRoom()) {
                  self.x = self.hspeed
                }
              } else if (self.x <= 0) {
                if (state.prevRoom()) {
                  self.x = state.room.width + self.hspeed
                }
              }
            },
          ],
        },

        draw: {
          actions: [
            self => {
              if (state.mouse.down.left) {
                draw.setLineWidth(2)
                draw.setColor('#753')
                draw.arrow(self.x, self.y, state.mouse.x, state.mouse.y)
              }
            },
          ],
        },

        mouseActive: {
          left: {
            actions: [
              self => {
                const speed =
                  utils.distance(
                    self.x,
                    self.y,
                    state.mouse.x,
                    state.mouse.y,
                  ) / 500

                self.motionAdd(
                  utils.direction(
                    self.x,
                    self.y,
                    state.mouse.x,
                    state.mouse.y,
                  ),
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
                if (self.y >= state.room.height) {
                  self.motionAdd(state.physics.DIRECTION_UP, self.jump)
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
                self.motionAdd(state.physics.DIRECTION_RIGHT, self.acceleration)
              },
            ],
          },

          ArrowLeft: {
            actions: [
              self => {
                self.setSprite(sprPlayerWalkL)
                self.motionAdd(state.physics.DIRECTION_LEFT, self.acceleration)
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

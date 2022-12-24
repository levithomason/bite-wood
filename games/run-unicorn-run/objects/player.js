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
  static name = 'objPlayer'

  constructor() {
    super({
      persist: true,
      sprite: sprPlayerIdleR,
      acceleration: 0.5,
      jump: 12,
      maxSpeed: 4,
      events: {
        mouseActive: {
          left(self) {
            const speed =
              utils.distance(self.x, self.y, gameMouse.x, gameMouse.y) / 500

            self.motionAdd(
              utils.direction(self.x, self.y, gameMouse.x, gameMouse.y),
              Math.min(1, speed),
            )
          },
        },

        keyDown: {
          ArrowUp(self) {
            if (collision.onBottom(self, 'solid')) {
              self.motionAdd(gamePhysics.DIRECTION_UP, self.jump)
            }
          },
        },

        keyUp: {
          ArrowRight(self) {
            self.setSprite(sprPlayerIdleR)
          },
          ArrowLeft(self) {
            self.setSprite(sprPlayerIdleL)
          },
        },

        keyActive: {
          ArrowRight(self) {
            self.setSprite(sprPlayerWalkR)
            self.motionAdd(gamePhysics.DIRECTION_RIGHT, self.acceleration)
          },

          ArrowLeft(self) {
            self.setSprite(sprPlayerWalkL)
            self.motionAdd(gamePhysics.DIRECTION_LEFT, self.acceleration)
          },
        },
      },
    })

    this.x = 100
    this.y = 573
  }

  step() {
    super.step()

    //
    // Gravity
    //

    // apply gravity if above floor bottom
    if (this.y < gameRooms.currentRoom.height) {
      this.motionAdd(this.gravity.direction, this.gravity.magnitude)
    }

    // terminal velocity & max speed
    this.vspeed = Math.min(this.vspeed, gamePhysics.terminalVelocity)

    //
    // Walking
    //

    // walking
    if (gameKeyboard.active.ArrowRight || gameKeyboard.active.ArrowLeft) {
      this.friction = 0
      this.hspeed =
        Math.sign(this.hspeed) * Math.min(Math.abs(this.hspeed), this.maxSpeed)
    } else {
      this.friction = gamePhysics.friction
    }

    // apply friction
    this.hspeed = this.hspeed * (1 - this.friction)

    // go to next/prev room on room edge
    if (this.x >= gameRooms.currentRoom.width) {
      if (gameRooms.nextRoom()) {
        this.x = this.hspeed
      }
    } else if (this.x <= 0) {
      if (gameRooms.prevRoom()) {
        this.x = gameRooms.currentRoom.width + this.hspeed
      }
    }

    // keep in room
    if (this.x < 0 && gameRooms.isFirstRoom()) {
      this.hspeed = 0
      this.x = 0
    } else if (this.x > gameRooms.currentRoom.width && gameRooms.isLastRoom()) {
      this.hspeed = 0
      this.x = gameRooms.currentRoom.width
    }

    if (this.y > gameRooms.currentRoom.height && this.vspeed > 0) {
      this.vspeed = 0
      this.y = gameRooms.currentRoom.height
    }
  }

  draw(drawing) {
    super.draw(drawing)

    if (gameMouse.down.left) {
      drawing.setLineWidth(2)
      drawing.setStrokeColor('#753')
      drawing.arrow(this.x, this.y, gameMouse.x, gameMouse.y)
    }
  }
}

export default Player

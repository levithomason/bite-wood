import {
  GameImage,
  gameKeyboard,
  gameMouse,
  GameObject,
  gamePhysics,
  gameRooms,
  GameSprite,
} from '../../../core/index.js'

import * as math from '../../../core/math.js'
import { onBottom } from '../../../core/collision.js'

// ----------------------------------------
// Player
// ----------------------------------------
export const imgPlayerR = new GameImage(
  '../run-unicorn-run/images/my-littlepony-right.png',
)
await imgPlayerR.loaded

const boundingBoxR = {
  boundingBoxTop: 5,
  boundingBoxLeft: 11,
  boundingBoxWidth: 28,
  boundingBoxHeight: 41,
}

const sprIdleRConfig = {
  frameFirstY: 543,
  frameFirstX: 0,
  frameWidth: 45,
  frameHeight: 46,
  frameCount: 16,
  scaleX: 2,
  scaleY: 2,
  insertionX: 24,
  insertionY: 46,
  stepsPerFrame: 8,
  ...boundingBoxR,
}
export const sprPlayerIdleR = new GameSprite(imgPlayerR, sprIdleRConfig)
export const sprPlayerIdleL = new GameSprite(imgPlayerR, {
  ...sprIdleRConfig,
  rtl: true,
})

const sprWalkRConfig = {
  frameCount: 6,
  frameWidth: 48,
  frameHeight: 46,
  frameFirstX: 55,
  frameFirstY: 12,
  scaleX: 2,
  scaleY: 2,
  insertionX: 24,
  insertionY: 46,
  stepsPerFrame: 2,
  ...boundingBoxR,
}
export const sprPlayerWalkR = new GameSprite(imgPlayerR, sprWalkRConfig)
export const sprPlayerWalkL = new GameSprite(imgPlayerR, {
  ...sprWalkRConfig,
  rtl: true,
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
              math.distance(self.x, self.y, gameMouse.x, gameMouse.y) / 500

            self.motionAdd(
              math.direction(self.x, self.y, gameMouse.x, gameMouse.y),
              Math.min(1, speed),
            )
          },
        },

        keyDown: {
          W(self) {
            if (onBottom(self, 'solid')) {
              self.motionAdd(gamePhysics.DIRECTION_UP, self.jump)
            }
          },
        },

        keyUp: {
          D(self) {
            self.setSprite(sprPlayerIdleR)
          },
          A(self) {
            self.setSprite(sprPlayerIdleL)
          },
        },

        keyActive: {
          D(self) {
            self.setSprite(sprPlayerWalkR)
            self.motionAdd(gamePhysics.DIRECTION_RIGHT, self.acceleration)
          },

          A(self) {
            self.setSprite(sprPlayerWalkL)
            self.motionAdd(gamePhysics.DIRECTION_LEFT, self.acceleration)
          },
        },
      },
    })
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
    if (
      this.y < gameRooms.currentRoom.height ||
      gameKeyboard.active.D ||
      gameKeyboard.active.A
    ) {
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

    if (gameMouse.active.left) {
      drawing
        .setLineWidth(2)
        .setStrokeColor('#753')
        .arrow(this.x, this.y, gameMouse.x, gameMouse.y)
    }
  }
}

export default Player

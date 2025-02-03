import {
  GameImage,
  gameKeyboard,
  gameMouse,
  GameObject,
  gamePhysics,
  gameRooms,
  GameSprite,
} from '../../../core/index.js'
import { direction } from '../../../core/math.js'
import { Banana } from './banana.js'
import { room0 } from '../rooms/room0.js'
import { sndShootBanana } from '../sounds/sound-shoot-banana.js'
import { sndJump } from '../sounds/sound-ape-jump.js'

// =============================================================================
// Ape
// =============================================================================

const imgApe = new GameImage('./sprites/ape.png')
await imgApe.loaded

const spriteConfigBase /** @type GameSpriteConfig */ = {
  frameWidth: 16,
  frameHeight: 16,
  insertionX: 8,
  insertionY: 15,
  scaleX: 4,
  scaleY: 4,
}
const spriteConfigStand = {
  ...spriteConfigBase,
  frameCount: 2,
  boundingBoxTop: 3,
  boundingBoxLeft: 2,
  boundingBoxHeight: 12,
  boundingBoxWidth: 13,
  stepsPerFrame: 30,
}
const spriteConfigRun = {
  ...spriteConfigBase,
  frameCount: 2,
  frameWidth: 16,
  frameHeight: 16,
  frameFirstY: 16,
  boundingBoxTop: 3,
  boundingBoxLeft: 2,
  boundingBoxHeight: 13,
  boundingBoxWidth: 14,
  stepsPerFrame: 8,
}
const spriteConfigJump = {
  ...spriteConfigBase,
  frameCount: 1,
  frameWidth: 16,
  frameHeight: 16,
  frameFirstY: 32,
  boundingBoxTop: 2,
  boundingBoxLeft: 1,
  boundingBoxHeight: 13,
  boundingBoxWidth: 15,
  stepsPerFrame: 8,
}
const sprAprStandR = new GameSprite(imgApe, { ...spriteConfigStand })
const sprAprStandL = new GameSprite(imgApe, {
  ...spriteConfigStand,
  rtl: true,
})

const sprAprRunR = new GameSprite(imgApe, { ...spriteConfigRun })
const sprAprRunL = new GameSprite(imgApe, { ...spriteConfigRun, rtl: true })

const sprAprJumpR = new GameSprite(imgApe, { ...spriteConfigJump })
const sprAprJumpL = new GameSprite(imgApe, { ...spriteConfigJump, rtl: true })

const STATES = {
  standR: {
    name: 'StandR',
    enter() {
      this.setSprite(sprAprStandR)
      this.hspeed = 0
    },
    step() {
      if (gameKeyboard.active.A) {
        this.setState(STATES.runL)
      } else if (gameKeyboard.active.D) {
        this.setState(STATES.runR)
      } else if (gameKeyboard.down.SPACE) {
        this.setState(STATES.jumpR)
      }
    },
  },
  standL: {
    name: 'StandL',
    enter() {
      this.setSprite(sprAprStandL)
      this.hspeed = 0
    },
    step() {
      if (gameKeyboard.active.A) {
        this.setState(STATES.runL)
      } else if (gameKeyboard.active.D) {
        this.setState(STATES.runR)
      } else if (gameKeyboard.down.SPACE) {
        this.setState(STATES.jumpL)
      }
    },
  },
  runR: {
    name: 'RunR',
    enter() {
      this.setSprite(sprAprRunR)
      this.hspeed = this.runSpeed
    },
    step() {
      if (gameKeyboard.up.D) {
        this.setState(STATES.standR)
      } else if (gameKeyboard.down.SPACE) {
        this.setState(STATES.jumpR)
      }
    },
  },
  runL: {
    name: 'RunL',
    enter() {
      this.setSprite(sprAprRunL)
      this.hspeed = -this.runSpeed
    },
    step() {
      if (gameKeyboard.up.A) {
        this.setState(STATES.standL)
      } else if (gameKeyboard.down.SPACE) {
        this.setState(STATES.jumpL)
      }
    },
  },
  jumpR: {
    name: 'JumpR',
    enter() {
      sndJump.playOne()
      this.setSprite(sprAprJumpR)
      this.vspeed = this.jumpSpeed
    },
    step() {
      if (this.y < gameRooms.currentRoom.height) {
        this.motionAdd(
          gamePhysics.gravity.direction,
          gamePhysics.gravity.magnitude,
        )
      } else {
        this.vspeed = 0
        this.y = gameRooms.currentRoom.height
        this.setState(STATES.standR)
      }
    },
  },
  jumpL: {
    name: 'JumpL',
    enter() {
      sndJump.playOne()
      this.setSprite(sprAprJumpL)
      this.vspeed = this.jumpSpeed
    },
    step() {
      if (this.y < gameRooms.currentRoom.height) {
        this.motionAdd(
          gamePhysics.gravity.direction,
          gamePhysics.gravity.magnitude,
        )
      } else {
        this.vspeed = 0
        this.y = gameRooms.currentRoom.height
        this.setState(STATES.standL)
      }
    },
  },
}

export class Ape extends GameObject {
  constructor() {
    super({
      sprite: sprAprStandR,
      events: {
        mouseDown: {
          left: () => {
            if (room0.instanceCount(Banana) >= 3) {
              return
            }

            const xOffset = this.state.name.endsWith('R') ? 16 : -16
            const x = this.x + xOffset
            const y = this.y - 32
            const banana = room0.instanceCreate(Banana, x, y)

            banana.direction = direction(
              this.x,
              this.y,
              gameMouse.x,
              gameMouse.y,
            )

            sndShootBanana.playMany()
          },
        },
      },
    })

    this.runSpeed = 4
    this.jumpSpeed = -8
    this.setState(STATES.standR)
  }

  setState(state) {
    this.state = state
    this.state.enter.call(this)
  }

  step() {
    super.step()
    this.state.step.call(this)
    this.keepInRoom()
  }
}

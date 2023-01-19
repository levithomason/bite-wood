import { Game } from '../../core/game.js'
import {
  GameImage,
  gameKeyboard,
  GameObject,
  gamePhysics,
  GameRoom,
  gameRooms,
  GameSprite,
} from '../../core/index.js'

const imgApe = new GameImage('./sprites/ape.png')
await imgApe.loaded

const spriteConfigBase /** @type GameSpriteConfig */ = {
  frameWidth: 16,
  frameHeight: 16,
  insertionX: 8,
  insertionY: 16,
  scaleX: 4,
  scaleY: 4,
}
const spriteConfigStand = {
  ...spriteConfigBase,
  frameCount: 2,
  boundingBoxTop: 3,
  boundingBoxLeft: 2,
  boundingBoxHeight: 11,
  boundingBoxWidth: 12,
  stepsPerFrame: 30,
}
const spriteConfigRun = {
  ...spriteConfigBase,
  frameCount: 2,
  frameWidth: 16,
  frameHeight: 16,
  frameFirstY: 16,
  boundingBoxTop: 3,
  boundingBoxLeft: 0,
  boundingBoxHeight: 13,
  boundingBoxWidth: 16,
  stepsPerFrame: 8,
}
const spriteConfigJump = {
  ...spriteConfigBase,
  frameCount: 1,
  frameWidth: 16,
  frameHeight: 16,
  frameFirstY: 32,
  boundingBoxTop: 3,
  boundingBoxLeft: 0,
  boundingBoxHeight: 13,
  boundingBoxWidth: 16,
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
      if (gameKeyboard.active.ArrowLeft) {
        this.setState(STATES.runL)
      } else if (gameKeyboard.active.ArrowRight) {
        this.setState(STATES.runR)
      } else if (gameKeyboard.active.ArrowUp) {
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
      if (gameKeyboard.active.ArrowLeft) {
        this.setState(STATES.runL)
      } else if (gameKeyboard.active.ArrowRight) {
        this.setState(STATES.runR)
      } else if (gameKeyboard.active.ArrowUp) {
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
      if (gameKeyboard.up.ArrowRight) {
        this.setState(STATES.standR)
      } else if (gameKeyboard.active.ArrowUp) {
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
      if (gameKeyboard.up.ArrowLeft) {
        this.setState(STATES.standL)
      } else if (gameKeyboard.active.ArrowUp) {
        this.setState(STATES.jumpL)
      }
    },
  },
  jumpR: {
    name: 'JumpR',
    enter() {
      this.setSprite(sprAprJumpR)
      this.vspeed = this.jumpSpeed
    },
    step() {
      if (this.y < gameRooms.currentRoom.height) {
        this.motionAdd(
          gamePhysics.DIRECTION_DOWN,
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
      this.setSprite(sprAprJumpL)
      this.vspeed = this.jumpSpeed
    },
    step() {
      if (this.y < gameRooms.currentRoom.height) {
        this.motionAdd(
          gamePhysics.DIRECTION_DOWN,
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

class Ape extends GameObject {
  constructor() {
    super({
      sprite: sprAprStandR,
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
  }
}

class Room extends GameRoom {
  constructor() {
    super(800, 600)
    this.backgroundColor = '#94c0aa'
  }
}

const room = new Room()
room.instanceCreate(Ape, 100, 600)

gameRooms.addRoom(room)

const game = new Game()
game.start()

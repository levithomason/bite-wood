import {
  direction,
  GameImage,
  gameKeyboard,
  gameMouse,
  GameObject,
  GameObjectStates,
  gamePhysics,
  gameRooms,
  GameSprite,
  GameSpriteConfig,
} from '@bite-wood/core'
import { Banana } from './banana.js'
import { room0 } from '../rooms/room0.js'
import { sndShootBanana } from '../sounds/sound-shoot-banana.js'
import { sndJump } from '../sounds/sound-ape-jump.js'

// =============================================================================
// Ape
// =============================================================================

const imgApe = new GameImage('./sprites/ape.png')
await imgApe.load()

const spriteConfigBase: GameSpriteConfig = {
  frameWidth: 16,
  frameHeight: 16,
  insertionX: 8,
  insertionY: 15,
  scaleX: 4,
  scaleY: 4,
}
const sprApeStandR = new GameSprite(imgApe, {
  ...spriteConfigBase,
  frameCount: 2,
  boundingBoxTop: 3,
  boundingBoxLeft: 2,
  boundingBoxHeight: 12,
  boundingBoxWidth: 13,
  stepsPerFrame: 30,
})
const sprApeStandL = await sprApeStandR.cloneRTL()

const sprApeRunR = new GameSprite(imgApe, {
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
})
const sprApeRunL = await sprApeRunR.cloneRTL()

const sprApeJumpR = new GameSprite(imgApe, {
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
})
const sprApeJumpL = await sprApeJumpR.cloneRTL()

const STATES: GameObjectStates<Ape> = {
  standR: {
    enter(self) {
      self.setSprite(sprApeStandR)
      self.hspeed = 0
    },
    step(self) {
      if (gameKeyboard.active.A) {
        self.setState('runL')
      } else if (gameKeyboard.active.D) {
        self.setState('runR')
      } else if (gameKeyboard.down[' ']) {
        self.setState('jumpR')
      }
    },
  },
  standL: {
    enter(self) {
      self.setSprite(sprApeStandL)
      self.hspeed = 0
    },
    step(self) {
      if (gameKeyboard.active.A) {
        self.setState('runL')
      } else if (gameKeyboard.active.D) {
        self.setState('runR')
      } else if (gameKeyboard.down[' ']) {
        self.setState('jumpL')
      }
    },
  },
  runR: {
    enter(self) {
      self.setSprite(sprApeRunR)
      self.hspeed = self.runSpeed
    },
    step(self) {
      if (gameKeyboard.up.D) {
        self.setState('standR')
      } else if (gameKeyboard.down[' ']) {
        self.setState('jumpR')
      }
    },
  },
  runL: {
    enter(self) {
      self.setSprite(sprApeRunL)
      self.hspeed = -self.runSpeed
    },
    step(self) {
      if (gameKeyboard.up.A) {
        self.setState('standL')
      } else if (gameKeyboard.down[' ']) {
        self.setState('jumpL')
      }
    },
  },
  jumpR: {
    enter(self) {
      sndJump.playOne()
      self.setSprite(sprApeJumpR)
      self.vspeed = self.jumpSpeed
    },
    step(self) {
      // TODO: As in other places, it makes no sense to need to check for a current room here.
      //       Step can/should only happen in a room...
      //       Make current room required before game loop starts.
      //       All running games should have a room.
      if (!gameRooms.currentRoom) return

      if (self.y < gameRooms.currentRoom.height) {
        self.motionAdd(
          gamePhysics.gravity.direction,
          gamePhysics.gravity.magnitude,
        )
      } else {
        self.vspeed = 0
        self.y = gameRooms.currentRoom.height
        self.setState('standR')
      }
    },
  },
  jumpL: {
    enter(self) {
      sndJump.playOne()
      self.setSprite(sprApeJumpL)
      self.vspeed = self.jumpSpeed
    },
    step(self) {
      if (!gameRooms.currentRoom) return

      if (self.y < gameRooms.currentRoom.height) {
        self.motionAdd(
          gamePhysics.gravity.direction,
          gamePhysics.gravity.magnitude,
        )
      } else {
        self.vspeed = 0
        self.y = gameRooms.currentRoom.height
        self.setState('standL')
      }
    },
  },
}

export class Ape extends GameObject {
  constructor() {
    super({
      states: STATES,
      sprite: sprApeStandR,
      events: {
        mouseDown: {
          left: () => {
            if (room0.instanceCount(Banana) >= 3) {
              return
            }

            const xOffset = this.state?.name.endsWith('R') ? 16 : -16
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
  }

  step() {
    super.step()
    this.keepInRoom()
  }
}

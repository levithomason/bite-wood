import {
  Game,
  GameAudio,
  GameImage,
  gameKeyboard,
  gameMouse,
  GameObject,
  GameParticles,
  gamePhysics,
  GameRoom,
  gameRooms,
  GameSprite,
  gameState,
} from '../../core/index.js'
import { direction, random, Vector } from '../../core/math.js'

// =============================================================================
// Global State
// =============================================================================

let snowDepth = 0

// =============================================================================
// Particles
// =============================================================================

class BlastParticles extends GameParticles {
  constructor() {
    super({
      count: 5,
      life: 500,
      speed: 4,
      friction: 0.1,
      rate: 1,
      size: 24,
      color: '#fff',
      shape: 'line',
    })
  }
}

class BarrelParticles extends GameParticles {
  constructor({ directionStart, directionEnd, speed }) {
    super({
      count: 3,
      life: 1500,
      speed,
      friction: 0.01,
      gravity: new Vector(0, 0.1),
      rate: 1,
      size: 8,
      directionStart,
      directionEnd,
      color: 'rgb(144, 113, 80)',
      shape: 'square',
    })
  }
}

class SmokeParticles extends GameParticles {
  constructor() {
    super({
      count: 20,
      life: 1000,
      speed: 0.25,
      rate: 1,
      size: 12,
      width: 32,
      height: 32,
      color: 'rgba(57,64,65,0.04)',
      shape: 'circle',
    })
  }
}

class SnowParticles extends GameParticles {
  constructor() {
    super({
      count: Infinity,
      life: 11000,
      speed: 1,
      rate: 100,
      directionStart: 90 - 5,
      directionEnd: 90 + 5,
      size: 3,
      width: 800,
      color: '#fff',
      shape: 'circle',
    })
  }
}

// =============================================================================
// Box
// =============================================================================

const imgBox = new GameImage('./sprites/box.png')
await imgBox.loaded

const sndBoxExplode = new GameAudio('./sounds/box-explode.m4a')

class Box extends GameObject {
  constructor() {
    super({
      sprite: new GameSprite(imgBox, {
        frameWidth: 8,
        frameHeight: 8,
        insertionX: 4,
        insertionY: 4,
        scaleX: 4,
        scaleY: 4,
        // TODO: this sound doesn't play when in the destroy event
        // events: {
        //   destroy: () => {
        //     sndBoxExplode.play()
        //   },
        // },
      }),
    })
  }

  onCollision(other) {
    if (other.constructor.name === 'Banana') {
      sndBoxExplode.playOne()
    }
  }
}

// =============================================================================
// Banana
// =============================================================================

const imgBanana = new GameImage('./sprites/banana.png')
await imgBanana.loaded

const sprBanana = new GameSprite(imgBanana, {
  frameWidth: 8,
  frameHeight: 8,
  insertionX: 4,
  insertionY: 4,
  scaleX: 4,
  scaleY: 4,
})

const sndShootBanana = new GameAudio('./sounds/jump.m4a')

class Banana extends GameObject {
  constructor() {
    super({
      speed: 14,
      sprite: sprBanana,
      gravity: gamePhysics.gravity,
    })
  }

  onCollision(other) {
    if (other.name === 'Box') {
      const barrelParticles = new BarrelParticles({
        directionStart: this.direction - 60,
        directionEnd: this.direction + 60,
        speed: this.speed * 0.5,
      })
      barrelParticles.x = other.x
      barrelParticles.y = other.y
      room.objects.push(barrelParticles)

      room.instanceCreate(
        SmokeParticles,
        other.x - other.boundingBoxWidth / 2,
        other.y - other.boundingBoxHeight / 2,
      )
      room.instanceCreate(BlastParticles, other.x, other.y)
      room.instanceDestroy(this)
      room.instanceDestroy(other)

      if (room.instanceCount(Box) === 0) {
        setTimeout(() => {
          window.location.reload()
        }, 1500)
      }
    }
  }

  step() {
    super.step()

    if (this.isOutsideRoom()) {
      room.instanceDestroy(this)
      return
    }

    // apply gravity
    this.motionAdd(gamePhysics.gravity.direction, gamePhysics.gravity.magnitude)
  }
}

// =============================================================================
// Ape
// =============================================================================

const imgApe = new GameImage('./sprites/ape.png')
await imgApe.loaded

const sndJump = new GameAudio('./sounds/jump-grunt.m4a')

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
      this.y = gameRooms.currentRoom.height - snowDepth

      if (gameKeyboard.active.A) {
        this.setState(STATES.runL)
      } else if (gameKeyboard.active.D) {
        this.setState(STATES.runR)
      } else if (gameKeyboard.down.W) {
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
      this.y = gameRooms.currentRoom.height - snowDepth

      if (gameKeyboard.active.A) {
        this.setState(STATES.runL)
      } else if (gameKeyboard.active.D) {
        this.setState(STATES.runR)
      } else if (gameKeyboard.down.W) {
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
      this.y = gameRooms.currentRoom.height - snowDepth

      if (gameKeyboard.up.D) {
        this.setState(STATES.standR)
      } else if (gameKeyboard.down.W) {
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
      this.y = gameRooms.currentRoom.height - snowDepth

      if (gameKeyboard.up.A) {
        this.setState(STATES.standL)
      } else if (gameKeyboard.down.W) {
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
      if (this.y < gameRooms.currentRoom.height - snowDepth) {
        this.motionAdd(
          gamePhysics.gravity.direction,
          gamePhysics.gravity.magnitude,
        )
      } else {
        this.vspeed = 0
        this.y = gameRooms.currentRoom.height - snowDepth
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
      if (this.y < gameRooms.currentRoom.height - snowDepth) {
        this.motionAdd(
          gamePhysics.gravity.direction,
          gamePhysics.gravity.magnitude,
        )
      } else {
        this.vspeed = 0
        this.y = gameRooms.currentRoom.height - snowDepth
        this.setState(STATES.standL)
      }
    },
  },
}

class Ape extends GameObject {
  constructor() {
    super({
      sprite: sprAprStandR,
      events: {
        mouseDown: {
          left: () => {
            if (room.instanceCount(Banana) >= 3) {
              return
            }

            const xOffset = this.state.name.endsWith('R') ? 16 : -16
            const x = this.x + xOffset
            const y = this.y - 32
            const banana = room.instanceCreate(Banana, x, y)

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
  }
}

// =============================================================================
// Room
// =============================================================================

class Room extends GameRoom {
  constructor() {
    super(800, 600)
    this.backgroundColor = '#94c0aa'

    const makeBox = (x = random(100, 700), y = random(150, 450)) => {
      this.instanceCreate(Box, x, y)
    }
    for (let i = 0; i < 14; i += 1) {
      makeBox(i * 50 + 50)
    }

    this.instanceCreate(Ape, 100, 600)
    this.instanceCreate(SnowParticles, 0, 0)

    setTimeout(() => {
      setInterval(() => {
        if (this.instanceCount(Box) > 0) {
          makeBox()
        }
      }, 2000)

      this.increaseSnow = true
    }, 11000 /* after snow hits ground */)
  }

  draw(drawing) {
    super.draw(drawing)

    if (this.increaseSnow) {
      snowDepth += 0.2
    }

    drawing.setFillColor('#fff')
    drawing.rectangle(0, 600 - snowDepth, 800, snowDepth)

    if (snowDepth > 600) {
      drawing.setFillColor('#000')
      drawing.rectangle(0, 0, 800, 600)

      drawing.setFillColor('#f00')
      drawing.setFontSize(60)
      drawing.setTextAlign('center')
      drawing.text('DUN DUN DUN!', 400, 300)
    }

    if (this.instanceCount(Box) === 0) {
      drawing.setFillColor('#fff')
      drawing.rectangle(0, 0, 800, 600)

      drawing.setFillColor('#0a0')
      drawing.setFontSize(60)
      drawing.setTextAlign('center')
      drawing.text('YOU WIN!', 400, 300)
    }
  }
}

const room = new Room()

gameRooms.addRoom(room)
// gameState.debug = true

// =============================================================================
// Game
// =============================================================================

const game = new Game()
game.start()

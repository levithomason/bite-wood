import {
  Game,
  GameDrawing,
  gameKeyboard,
  GameObject,
  gamePhysics,
  GameRoom,
  gameRooms,
} from '../../core/index.js'
import {
  direction,
  distance,
  offsetX,
  offsetY,
  scale,
} from '../../core/math.js'
import { loadState } from '../../editors/sprite-editor/storage-manager.js'

class Room extends GameRoom {
  backgroundColor = '#a5de93'
}

const room = new Room({ width: 800, height: 600 })

gameRooms.addRoom(room)

class Block extends GameObject {
  static width = 50
  static height = 50
  draw(drawing) {
    super.draw(drawing)

    drawing
      .setLineWidth(2)
      .setFillColor('transparent')
      .setStrokeColor('coral')
      .roundedRectangle(this.x, this.y, Block.width, Block.height, 4)
  }
}
room.instanceCreate(Block, 200, 200)
room.instanceCreate(Block, 200, 300)
room.instanceCreate(Block, 300, 200)
room.instanceCreate(Block, 300, 300)

class Bullet extends GameObject {
  create() {
    this.speed = 10
  }

  step() {
    super.step()

    if (this.isOutsideRoom()) {
      room.instanceDestroy(this)
    }
  }

  draw(drawing) {
    super.draw(drawing)

    drawing
      .setStrokeColor('coral')
      .setFillColor('coral')
      .circle(this.x, this.y, 4)
  }
}

class Globby extends GameObject {
  constructor() {
    super({
      boundingBoxTop: -14,
      boundingBoxLeft: -14,
      boundingBoxWidth: -14 * 2,
      boundingBoxHeight: -14 * 2,
      events: {
        keyDown: {
          ' ': () => {
            const bullet = gameRooms.currentRoom.instanceCreate(
              Bullet,
              offsetX(
                this.x,
                this.getElongatedSize() + this.strokeWidth,
                this.direction,
              ),
              offsetY(
                this.y,
                this.getElongatedSize() + this.strokeWidth,
                this.direction,
              ),
            )
            bullet.direction = this.direction
          },
        },
      },
    })
    this.size = 10
    this.acceleration = 0.3
    this.maxSpeed = 4
    this.strokeWidth = 8

    // physics
    this.friction = 0.1
    // this.gravity = gamePhysics.gravity
  }

  draw(drawing) {
    super.draw(drawing)

    drawing
      .setLineWidth(this.strokeWidth)
      .setFillColor('#ddd')
      .setStrokeColor('#fff')
      .ellipse(
        this.x,
        this.y,
        this.getElongatedSize(),
        this.size,
        this.direction,
      )

    // eyes
    const eyeDist = this.size + Math.pow(this.speed * 5, 0.6)
    const eyeGap = 50 * (1 - this.speed / (this.maxSpeed * 2))
    const eyeSize = 6

    // whites
    drawing
      .setLineWidth(2)
      .setFillColor('white')
      .setStrokeColor('#888')
      .circle(
        offsetX(this.x, eyeDist, this.direction - eyeGap),
        offsetY(this.y, eyeDist, this.direction - eyeGap),
        eyeSize,
      )
      .circle(
        offsetX(this.x, eyeDist, this.direction + eyeGap),
        offsetY(this.y, eyeDist, this.direction + eyeGap),
        eyeSize,
      )

    // pupils
    const eyePupilSize = eyeSize * 0.5
    const eyePupilDist = Math.pow(eyeDist, 1.05)
    const eyePupilGap = Math.pow(eyeGap, 0.9)

    drawing
      .setLineWidth(0)
      .setFillColor('#284')
      .setStrokeColor('transparent')
      .circle(
        offsetX(this.x, eyePupilDist, this.direction - eyePupilGap),
        offsetY(this.y, eyePupilDist, this.direction - eyePupilGap),
        eyePupilSize,
      )
      .circle(
        offsetX(this.x, eyePupilDist, this.direction + eyePupilGap),
        offsetY(this.y, eyePupilDist, this.direction + eyePupilGap),
        eyePupilSize,
      )
  }

  getElongatedSize() {
    return (
      this.size * Math.max(1, Math.pow((this.speed * 2) / this.maxSpeed, 0.3))
    )
  }

  step() {
    super.step()

    if (gameKeyboard.active.A) {
      this.motionAdd(gamePhysics.DIRECTION_LEFT, this.acceleration)
    } else if (gameKeyboard.active.D) {
      this.motionAdd(gamePhysics.DIRECTION_RIGHT, this.acceleration)
    } else {
      this.hspeed *= 1 - this.friction
    }

    if (gameKeyboard.active.W) {
      this.motionAdd(gamePhysics.DIRECTION_UP, this.acceleration)
    } else if (gameKeyboard.active.S) {
      this.motionAdd(gamePhysics.DIRECTION_DOWN, this.acceleration)
    } else {
      this.vspeed *= 1 - this.friction
    }

    if (this.speed > this.maxSpeed) {
      this.speed = this.maxSpeed
    }
  }
}

room.instanceCreate(Globby, 100, 550)

class Fuego extends GameObject {
  constructor() {
    super()
    const state = loadState()

    this.width = state.width
    this.height = state.height
    this.frame0 = new ImageData(
      new Uint8ClampedArray(state.frames[0]),
      this.width,
      this.height,
    )
    this.frame1 = new ImageData(
      new Uint8ClampedArray(state.frames[1]),
      this.width,
      this.height,
    )
    this.frame2 = new ImageData(
      new Uint8ClampedArray(state.frames[2]),
      this.width,
      this.height,
    )

    this.drawing = new GameDrawing(this.width, this.height)
    this.drawing.imageData(this.frame1, 0, 0)
  }

  draw(drawing) {
    super.draw(drawing)

    drawing.image(this.drawing.canvas, this.x, this.y)
  }
  step() {
    super.step()

    const globby = gameRooms.currentRoom.objects.find((object) => {
      return object instanceof Globby
    })

    const distanceToGlobby = distance(this.x, this.y, globby.x, globby.y)
    const directionToGlobby = direction(this.x, this.y, globby.x, globby.y)

    // accelerate toward player
    // slowly when far away, quickly when close
    const distanceMotionAddSlowdown = scale(distanceToGlobby, 100, 200, 0, 0.18)
    this.motionAdd(directionToGlobby, 0.2 - distanceMotionAddSlowdown)

    // limit max speed
    // slow when far away, fast when close
    const distanceMaxSpeedSlowdown = scale(distanceToGlobby, 100, 200, 0, 2)
    const maxSpeed = 2.25 - distanceMaxSpeedSlowdown
    this.speed = Math.min(this.speed, maxSpeed)

    // show attack frame when close
    const attackDistance = 100
    if (distanceToGlobby < attackDistance) {
      this.drawing.imageData(this.frame2, 0, 0)
    } else {
      this.drawing.imageData(this.frame1, 0, 0)
    }
  }
}
room.instanceCreate(Fuego, room.width - 100, 100)

// gameState.debug = true
const game = new Game()
game.start()

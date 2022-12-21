import {
  Game,
  GameObject,
  GameRoom,
  gameKeyboard,
  gamePhysics,
  gameRooms,
  GameSprite,
} from '../../core/index.js'
import {
  direction,
  distance,
  offsetX,
  offsetY,
  toRadians,
} from '../../core/math.js'

class Room extends GameRoom {
  draw(drawing) {
    super.draw(drawing)
    drawing.fill('#223')
  }
}

const room = new Room(800, 600)

gameRooms.addRoom(room)

class Block extends GameObject {
  static width = 50
  static height = 50
  draw(drawing) {
    super.draw(drawing)

    drawing.setLineWidth(2)
    drawing.setFillColor('transparent')
    drawing.setStrokeColor('coral')
    drawing.roundedRectangle(this.x, this.y, Block.width, Block.height, 4)
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

    drawing.setStrokeColor('coral')
    drawing.setFillColor('coral')
    drawing.circle(this.x, this.y, 4)
  }
}

class Globby extends GameObject {
  constructor() {
    super({
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

    drawing.setLineWidth(this.strokeWidth)
    drawing.setFillColor('#ddd')
    drawing.setStrokeColor('#fff')
    drawing.ellipse(
      this.x,
      this.y,
      this.getElongatedSize(),
      this.size,
      toRadians(this.direction),
    )

    // eyes
    const eyeDist = this.size + Math.pow(this.speed * 5, 0.6)
    const eyeGap = 50 * (1 - this.speed / (this.maxSpeed * 2))
    const eyeSize = 6

    // whites
    drawing.setLineWidth(2)
    drawing.setFillColor('white')
    drawing.setStrokeColor('#888')

    drawing.circle(
      offsetX(this.x, eyeDist, this.direction - eyeGap),
      offsetY(this.y, eyeDist, this.direction - eyeGap),
      eyeSize,
    )
    drawing.circle(
      offsetX(this.x, eyeDist, this.direction + eyeGap),
      offsetY(this.y, eyeDist, this.direction + eyeGap),
      eyeSize,
    )

    // pupils
    const eyePupilSize = eyeSize * 0.5
    const eyePupilDist = Math.pow(eyeDist, 1.05)
    const eyePupilGap = Math.pow(eyeGap, 0.9)

    drawing.setLineWidth(0)
    drawing.setFillColor('#284')

    drawing.setStrokeColor('transparent')
    drawing.circle(
      offsetX(this.x, eyePupilDist, this.direction - eyePupilGap),
      offsetY(this.y, eyePupilDist, this.direction - eyePupilGap),
      eyePupilSize,
    )
    drawing.circle(
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

    if (gameKeyboard.active.ArrowLeft) {
      this.motionAdd(gamePhysics.DIRECTION_LEFT, this.acceleration)
    } else if (gameKeyboard.active.ArrowRight) {
      this.motionAdd(gamePhysics.DIRECTION_RIGHT, this.acceleration)
    } else {
      this.hspeed *= 1 - this.friction
    }

    if (gameKeyboard.active.ArrowUp) {
      this.motionAdd(gamePhysics.DIRECTION_UP, this.acceleration)
    } else if (gameKeyboard.active.ArrowDown) {
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

const game = new Game()
game.start()

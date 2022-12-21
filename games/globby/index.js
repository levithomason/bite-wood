import {
  Game,
  GameObject,
  GameRoom,
  gameKeyboard,
  gamePhysics,
  gameRooms,
  GameSprite,
} from '../../core/index.js'
import { direction, distance, toRadians } from '../../core/math.js'

class Room extends GameRoom {
  draw(drawing) {
    super.draw(drawing)
    drawing.fill('#223')
  }
}

const room = new Room(800, 600)

gameRooms.addRoom(room)

class Block extends GameObject {
  static width = 100
  static height = 100
  draw(drawing) {
    super.draw(drawing)

    drawing.setLineWidth(2)
    drawing.setFillColor('transparent')
    drawing.setStrokeColor('coral')
    drawing.roundedRectangle(this.x, this.y, Block.width, Block.height)
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

    drawing.setStrokeColor('mediumvioletred')
    drawing.setFillColor('mediumvioletred')
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
              this.x,
              this.y,
            )
            bullet.direction = this.direction
          },
        },
      },
    })
    this.size = 20
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
      this.size * Math.max(1, Math.pow((this.speed * 2) / this.maxSpeed, 0.5)),
      this.size,
      toRadians(this.direction),
    )

    // eyes
    drawing.setLineWidth(2)
    drawing.setFillColor('white')
    drawing.setStrokeColor('#888')
    const eyeDistanceFromCenter = this.size + Math.pow(this.speed * 5, 0.8)
    drawing.circle(
      this.x + eyeDistanceFromCenter * Math.cos(toRadians(this.direction + 30)),
      this.y + eyeDistanceFromCenter * Math.sin(toRadians(this.direction + 30)),
      5,
    )
    drawing.circle(
      this.x + eyeDistanceFromCenter * Math.cos(toRadians(this.direction - 30)),
      this.y + eyeDistanceFromCenter * Math.sin(toRadians(this.direction - 30)),
      5,
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

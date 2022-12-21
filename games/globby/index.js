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

// class Ground extends GameObject {
//   static width = 100
//   static height = 20
//
//   // constructor() {
//   //   super()
//   //   // this.solid = true
//   //   // this.sprite = new GameSprite({
//   //   //   boundingBoxHeight: 20,
//   //   //   boundingBoxLeft: 0,
//   //   // })
//   // }
//
//   draw(drawing) {
//     super.draw(drawing)
//
//     drawing.rectangle(this.x, this.y, Ground.width, Ground.height)
//   }
// }
// room.instanceCreate(Ground, 0, room.height - Ground.height)

class Globby extends GameObject {
  constructor() {
    super()
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
      this.x - this.size,
      this.y - this.size - this.strokeWidth,
      this.size * Math.max(1, Math.pow((this.speed * 2) / this.maxSpeed, 0.5)),
      this.size,
      toRadians(this.direction),
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

room.instanceCreate(Globby, 400, 400)

const game = new Game()
game.start()

import {
  Game,
  gameMouse,
  GameObject,
  GameRoom,
  gameRooms,
} from '../../core/index.js'
import { Vector } from '../../core/math.js'
import {
  collisionLineLine,
  collisionLineRectangle,
} from '../../core/collision.js'

class MouseLine extends GameObject {
  constructor() {
    super({
      events: {
        mouseDown: {
          left: () => {
            this.x = gameMouse.x
            this.y = gameMouse.y
          },
        },
      },
    })
  }
  create() {
    this.vector = new Vector(gameMouse.x - this.x, gameMouse.y - this.y)
  }

  get x2() {
    return this.x + this.vector.x
  }
  get y2() {
    return this.y + this.vector.y
  }
  set x2(val) {
    this.vector.x = val - this.x
  }
  set y2(val) {
    this.vector.y = val - this.y
  }
  get width() {
    return this.x2 - this.x
  }
  get height() {
    return this.y2 - this.y
  }

  step() {
    super.step()
    this.x2 = gameMouse.x
    this.y2 = gameMouse.y

    this.collisionLine = collisionLineLine(
      this.x,
      this.y,
      this.x2,
      this.y2,
      room.line.x1,
      room.line.y1,
      room.line.x2,
      room.line.y2,
    )

    this.collisionRectangle = collisionLineRectangle(
      this.x,
      this.y,
      this.x2,
      this.y2,
      room.rectangle.x1,
      room.rectangle.y1,
      room.rectangle.x2,
      room.rectangle.y2,
    )
  }

  draw(drawing) {
    super.draw(drawing)
    drawing.setTextAlign('center')
    drawing.setTextBaseline('middle')

    // draw default line under all
    drawing.setLineWidth(1)
    drawing.setStrokeColor('#0f0')
    drawing.setFillColor('#0f0')
    drawing.arrow(this.x, this.y, this.x2, this.y2)

    if (this.collisionLine) {
      drawing.setStrokeColor('transparent')
      drawing.setFillColor('#f00')
      drawing.circle(this.collisionLine.x, this.collisionLine.y, 8)
    }

    if (this.collisionRectangle) {
      drawing.setStrokeColor('transparent')
      drawing.setFillColor('#f00')
      drawing.circle(this.collisionRectangle.x, this.collisionRectangle.y, 8)
    }
  }
}

class Room extends GameRoom {
  constructor() {
    super({ width: 600, height: 600 })
    this.backgroundColor = '#123'
    this.line = {
      x1: this.width * 0.3,
      x2: this.width * 0.7,
      y1: this.height * 0.7,
      y2: this.height * 0.8,
    }

    this.rectangle = {
      x1: this.width * 0.3,
      x2: this.width * 0.7,
      y1: this.height * 0.1,
      y2: this.height * 0.2,
    }

    this.instanceCreate(MouseLine, this.width / 2, this.height / 2)

    gameMouse.x = this.width / 2
    gameMouse.y = this.height - this.height / 3
  }

  draw(drawing) {
    super.draw(drawing)

    // draw line
    drawing.setLineWidth(1)
    drawing.setStrokeColor('#fff')
    drawing.setFillColor('transparent')
    drawing.line(this.line.x1, this.line.y1, this.line.x2, this.line.y2)

    // draw rectangle
    drawing.setLineWidth(1)
    drawing.setStrokeColor('#fff')
    drawing.setFillColor('transparent')
    drawing.rectangle(
      this.rectangle.x1,
      this.rectangle.y1,
      this.rectangle.x2 - this.rectangle.x1,
      this.rectangle.y2 - this.rectangle.y1,
    )
  }
}

const room = new Room()

gameRooms.addRoom(room)

// gameState.debug = true

const game = new Game()
game.start()

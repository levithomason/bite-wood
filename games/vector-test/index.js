import {
  Game,
  gameKeyboard,
  gameMouse,
  GameRoom,
  gameRooms,
} from '../../core/index.js'
import { Vector } from '../../core/math.js'

class Room extends GameRoom {
  constructor() {
    super({ width: 800, height: 600 })
    this.backgroundColor = '#123'

    this.vector = new Vector(200, -150)
  }

  get vectorOrigin() {
    return {
      x: this.width / 2,
      y: this.height / 2,
    }
  }

  draw(drawing) {
    super.draw(drawing)
    const { x, y } = this.vectorOrigin

    let horizontalOperation = ''
    let verticalOperation = ''

    if (gameKeyboard.active.W) {
      this.vector.magnitude += 5
      verticalOperation = '+ magnitude'
    } else if (gameKeyboard.active.S) {
      this.vector.magnitude -= this.vector.magnitude <= 5 ? 0 : 5
      verticalOperation = '- magnitude'
    }

    if (gameKeyboard.active.A) {
      if (gameKeyboard.active.SHIFT) {
        this.vector.angle -= 0.036
        horizontalOperation = '- angle'
      } else {
        this.vector.direction -= 2
        horizontalOperation = '- direction'
      }
    } else if (gameKeyboard.active.D) {
      if (gameKeyboard.active.SHIFT) {
        this.vector.angle += 0.036
        horizontalOperation = '+ angle'
      } else {
        this.vector.direction += 2
        horizontalOperation = '+ direction'
      }
    } else if (gameMouse.active.left) {
      this.vector.x = gameMouse.x - x
      this.vector.y = gameMouse.y - y
    }

    drawing.vectorDebug(x, y, this.vector, '#fff')

    // draw instructions for changing the vector's magnitude by pressing +/-
    drawing
      .setFontFamily('monospace')
      .setFillColor('#fff')
      .setFontSize(12)
      .text('magnitude = w/s', 16, 20)
      .text('direction = a/d', 16, 40)
      .text('angle     = shift + a/d', 16, 60)
      .text('move      = click', 16, 80)

    // show the current operation being performed on the vector
    drawing
      .setFontFamily('monospace')
      .setFontSize(12)
      .setFillColor('#0f0')
      .text(horizontalOperation, this.width - 100, 20)
      .text(verticalOperation, this.width - 100, 40)
  }
}

const room = new Room()
gameRooms.addRoom(room)

const game = new Game()
game.start()

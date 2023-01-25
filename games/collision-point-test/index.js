import { Game } from '../../core/game.js'
import { GameRoom, gameRooms } from '../../core/index.js'
import { collisionPointRectangle } from '../../core/collision.js'

class Room extends GameRoom {
  constructor() {
    super(800, 600)
    this.backgroundColor = '#123'

    this.rect = { x: 250, y: 150, width: 300, height: 300 }

    this.points = new Array(100).fill(0).map(() => {
      const x = Math.random() * 800
      const y = Math.random() * 600
      const isColliding = collisionPointRectangle(
        x,
        y,
        this.rect.x,
        this.rect.y,
        this.rect.x + this.rect.width,
        this.rect.y + this.rect.height,
      )

      return { x, y, isColliding }
    })
  }

  draw(drawing) {
    super.draw(drawing)

    // rectangle
    drawing.setLineWidth(1)
    drawing.setStrokeColor('#fff')
    drawing.setFillColor('transparent')
    drawing.rectangle(
      this.rect.x,
      this.rect.y,
      this.rect.width,
      this.rect.height,
    )

    // points
    this.points.forEach(({ x, y, isColliding }) => {
      drawing.setLineWidth(2)
      drawing.setStrokeColor(isColliding ? '#f00' : '#0f0')
      drawing.setFillColor('transparent')
      drawing.circle(x, y, 1)
    })
  }
}

const room = new Room()
gameRooms.addRoom(room)

const game = new Game()
game.start()

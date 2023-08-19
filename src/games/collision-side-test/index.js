import { Game, GameObject, GameRoom, gameRooms } from '../../core/index.js'

class Box extends GameObject {
  constructor({ size, ...rest }) {
    super({
      boundingBoxTop: -size / 2,
      boundingBoxLeft: -size / 2,
      boundingBoxWidth: size,
      boundingBoxHeight: size,
      color: '#fff',
      ...rest,
    })
  }

  draw(drawing) {
    drawing.setLineWidth(1).setFillColor('transparent')

    drawing
      .setStrokeColor(this.hasCollision.onTop ? 'red' : this.color)
      .line(
        this.boundingBoxLeft,
        this.boundingBoxTop,
        this.boundingBoxRight,
        this.boundingBoxTop,
      )
    drawing
      .setStrokeColor(this.hasCollision.onLeft ? 'red' : this.color)
      .line(
        this.boundingBoxLeft,
        this.boundingBoxTop,
        this.boundingBoxLeft,
        this.boundingBoxBottom,
      )
    drawing
      .setStrokeColor(this.hasCollision.onRight ? 'red' : this.color)
      .line(
        this.boundingBoxRight,
        this.boundingBoxTop,
        this.boundingBoxRight,
        this.boundingBoxBottom,
      )
    drawing
      .setStrokeColor(this.hasCollision.onBottom ? 'red' : this.color)
      .line(
        this.boundingBoxLeft,
        this.boundingBoxBottom,
        this.boundingBoxRight,
        this.boundingBoxBottom,
      )
  }

  onCollision(other) {
    super.onCollision(other)

    if (this.name === 'small' && other.name === 'big') {
      // moveOutside(this, other)
    }
  }
}

class Room extends GameRoom {
  constructor() {
    super({
      width: 800,
      height: 600,
      backgroundColor: '#123',
    })
    const size = 300

    const centerX = this.width / 2
    const centerY = this.height / 2

    const topLeft = [centerX - size / 2, centerY - size / 2]
    const topCenter = [centerX, centerY - size / 2]
    const topRight = [centerX + size / 2, centerY - size / 2]
    const middleLeft = [centerX - size / 2, centerY]
    const middleCenter = [centerX, centerY]
    const middleRight = [centerX + size / 2, centerY]
    const bottomLeft = [centerX - size / 2, centerY + size / 2]
    const bottomCenter = [centerX, centerY + size / 2]
    const bottomRight = [centerX + size / 2, centerY + size / 2]

    this.instanceCreate(Box, centerX, centerY, { size, name: 'big' })

    // overlap a box on each side and corner
    const sizeSmall = size / 4
    const config = { size: sizeSmall, name: 'small' }

    const smallBoxLocations = [
      topLeft,
      topCenter,
      topRight,
      middleLeft,
      middleCenter,
      middleRight,
      bottomLeft,
      bottomCenter,
      bottomRight,
    ]

    for (const [x, y] of smallBoxLocations) {
      this.instanceCreate(Box, x, y, config)
    }
  }
}

gameRooms.addRoom(new Room())

const game = new Game({ stepsPerSecond: 1 / 5 })
game.start()

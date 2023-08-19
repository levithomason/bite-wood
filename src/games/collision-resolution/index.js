import {
  Game,
  GameObject,
  GameRoom,
  gameRooms,
  gameState,
} from '../../core/index.js'

let blockA
let blockB

class Block extends GameObject {
  static width = 100
  static height = 200
  constructor(config) {
    super({
      ...config,
      boundingBoxTop: -Block.height / 2,
      boundingBoxLeft: -Block.width / 2,
      boundingBoxWidth: Block.width,
      boundingBoxHeight: Block.height,
    })
  }

  step() {
    super.step()
    this.keepInRoom(1)
  }

  draw(drawing) {
    super.draw(drawing)

    drawing.setLineWidth(1)

    // draw bounding box
    drawing.setStrokeColor('transparent')
    drawing.setFillColor(this.color)
    drawing.rectangle(
      this.boundingBoxLeft,
      this.boundingBoxTop,
      this.boundingBoxWidth,
      this.boundingBoxHeight,
    )

    // draw line from x/y previous to x/y current
    const color = this.collision ? '#f00' : '#000'
    drawing.setStrokeColor(color)
    drawing.setFillColor(color)
    drawing.arrow(this.xPrevious, this.yPrevious, this.x, this.y)

    // draw collision point
    if (this.name === 'blockB' && this.collision) {
      drawing.setLineWidth(1)
      drawing.setStrokeColor('transparent')
      drawing.setFillColor('#ff0')
      drawing.circle(this.collision.x, this.collision.y, 10)
    }

    drawing
      .setFillColor('#000')
      .setFontSize(14)
      .setTextAlign('center')
      .text(this.name, this.x, this.y - this.boundingBoxHeight / 2 - 12)
  }
}

class Room extends GameRoom {
  constructor() {
    super({ width: 400, height: 600 })
    this.backgroundColor = '#fff'

    blockA = this.instanceCreate(Block, this.width / 2, this.height / 2, {
      name: 'blockA',
    })
    blockB = this.instanceCreate(
      Block,
      this.width - this.width / 2 + Block.width * 2,
      this.height / 2,
      {
        name: 'blockB',
      },
    )

    // blockA.hspeed = 90
    blockA.color = '#0000ff44'
    blockB.hspeed = -30
    blockB.color = '#ff000044'
  }

  draw(drawing) {
    super.draw(drawing)

    drawing.setLineWidth(1)
    drawing.setStrokeColor('#888')
    drawing.rectangle(
      blockA.boundingBoxLeft - blockB.boundingBoxWidth / 2,
      blockA.boundingBoxTop - blockB.boundingBoxHeight / 2,
      blockA.boundingBoxWidth + blockB.boundingBoxWidth,
      blockA.boundingBoxHeight + blockB.boundingBoxHeight,
    )
  }
}

gameRooms.addRoom(new Room())

const game = new Game({ stepsPerSecond: 0.25 })
gameState.debug = false
game.start()

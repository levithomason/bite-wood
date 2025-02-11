import {
  Game,
  GameObject,
  GameRoom,
  gameRooms,
  gameState,
} from '../../core/index.js'

class Block extends GameObject {
  static width = 90
  static height = 90
  constructor() {
    super({
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

    drawing.setLineWidth(0)
    drawing.setStrokeColor(this.strokeColor)
    drawing.setFillColor(this.color)
    drawing.rectangle(
      this.boundingBoxLeft,
      this.boundingBoxTop,
      this.boundingBoxWidth,
      this.boundingBoxHeight,
    )
  }
}

class Room extends GameRoom {
  constructor() {
    super({ width: 800, height: 600 })
    this.backgroundColor = '#fff'

    const blockA = this.instanceCreate(Block, this.width / 3, this.height / 2)
    const blockB = this.instanceCreate(
      Block,
      this.width - this.width / 3,
      this.height / 2,
    )

    blockA.hspeed = Block.width
    blockA.color = '#0000ff44'
    blockA.strokeColor = '#00008888'
    blockB.hspeed = -Block.width
    blockB.color = '#ff000044'
    blockB.strokeColor = '#88000088'
  }
}

gameRooms.addRoom(new Room())

const game = new Game({ stepsPerSecond: 0.25 })
gameState.debug = false
game.start()

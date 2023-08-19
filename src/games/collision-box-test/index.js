import {
  Game,
  GameObject,
  GameRoom,
  gameRooms,
  gameState,
} from '../../core/index.js'
import { random } from '../../core/math.js'
import { moveOutside } from '../../core/collision.js'

const BOX_SIZE_MIN = 10
const BOX_SIZE_MAX = 80
const BOX_COUNT = 20

class Box extends GameObject {
  constructor() {
    super(
      (() => {
        let w = random(BOX_SIZE_MAX, BOX_SIZE_MIN)
        let h = random(BOX_SIZE_MAX, BOX_SIZE_MIN)

        return {
          speed: random(0.25, 1),
          direction: random(360),

          // TODO: It is confusing that the config for bounding box is relative to the x,y position
          //       but the this.boundingBox* properties are abs positions in the room.
          //       Consider using the word "offset" in the config or something to differentiate the two.
          //       -
          //       We should also consider creating a Box class with these properties and collision helpers
          //
          boundingBoxTop: -h / 2,
          boundingBoxLeft: -w / 2,
          boundingBoxWidth: w,
          boundingBoxHeight: h,
        }
      })(),
    )
  }

  step() {
    super.step()
    this.keepInRoom(1)
  }

  onCollision(other) {
    super.onCollision(other)

    moveOutside(this, other)
  }

  draw(drawing) {
    super.draw(drawing)

    const color = this.collision ? '#f00' : '#fff'
    drawing.setStrokeColor(color)
    drawing.setFillColor('transparent')
    drawing.rectangle(
      this.boundingBoxLeft,
      this.boundingBoxTop,
      this.boundingBoxWidth,
      this.boundingBoxHeight,
    )

    drawing.setLineWidth(1)
    drawing.setStrokeColor(color)
    drawing.arrow(this.xPrevious, this.yPrevious, this.x, this.y, 3)

    if (this.xPrevious !== this.x || this.yPrevious !== this.y) {
      const ghostColor = this.collision ? '#ff000044' : '#ffffff44'
      drawing.setLineWidth(1)
      drawing.setStrokeColor(ghostColor)
      drawing.rectangle(
        this.boundingBoxLeft + (this.xPrevious - this.x),
        this.boundingBoxTop + (this.yPrevious - this.y),
        this.boundingBoxWidth,
        this.boundingBoxHeight,
      )

      if (this.collision) {
        drawing.setLineWidth(1)
        drawing.setStrokeColor('#ff0')
        drawing.circle(this.collision.x, this.collision.y, 3)
      }
    }
  }
}

class Room extends GameRoom {
  constructor() {
    super({ width: 800, height: 600 })
    this.backgroundColor = '#234'

    this.stationaryBox = this.instanceCreate(Box, 400, 300)
    this.stationaryBox.speed = 0
  }
}

const room = new Room()
for (let i = 0; i < BOX_COUNT; i += 1) {
  room.instanceCreate(
    Box,
    room.randomXPosition(BOX_SIZE_MAX, BOX_SIZE_MAX),
    room.randomYPosition(BOX_SIZE_MAX, BOX_SIZE_MAX),
  )
}

gameRooms.addRoom(room)

gameState.debug = false

const game = new Game({ stepsPerSecond: 60 })
game.start()

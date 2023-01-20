import { Game } from '../../core/game.js'
import { GameObject, GameRoom, gameRooms, gameState } from '../../core/index.js'
import { random } from '../../core/math.js'
import * as collision from '../../core/collision.js'

let OBJECT_SIZE_MIN = 10
let OBJECT_SIZE_MAX = 80
let OBJECT_COUNT = 20

class Object extends GameObject {
  constructor() {
    super(
      (() => {
        let w = random(OBJECT_SIZE_MAX, OBJECT_SIZE_MIN)
        let h = random(OBJECT_SIZE_MAX, OBJECT_SIZE_MIN)

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
    if (this.boundingBoxLeft <= 0) {
      this.hspeed = Math.abs(this.hspeed)
    } else if (this.boundingBoxRight >= room.width) {
      this.hspeed = -Math.abs(this.hspeed)
    }

    if (this.boundingBoxTop <= 0) {
      this.vspeed = Math.abs(this.vspeed)
    } else if (this.boundingBoxBottom >= room.height) {
      this.vspeed = -Math.abs(this.vspeed)
    }

    // TODO bounce objects off each other
    // collision.objects(this, 'any', (other /** @type GameObject */) => {
    //   // bounce
    //   if (collision.onTop(this, other) || collision.onBottom(this, other)) {
    //     this.vspeed = -this.vspeed
    //   } else if (
    //     collision.onLeft(this, other) ||
    //     collision.onRight(this, other)
    //   ) {
    //     this.hspeed = -this.hspeed
    //   }
    // })
  }

  draw(drawing) {
    super.draw(drawing)
  }
}

class Room extends GameRoom {
  constructor() {
    super(800, 600)
    this.backgroundColor = '#234'
  }
}

const room = new Room()
for (let i = 0; i < OBJECT_COUNT; i += 1) {
  room.instanceCreate(
    Object,
    room.randomXPosition(OBJECT_SIZE_MAX, OBJECT_SIZE_MAX),
    room.randomYPosition(OBJECT_SIZE_MAX, OBJECT_SIZE_MAX),
  )
}

gameRooms.addRoom(room)

gameState.debug = true

const game = new Game()
game.start()

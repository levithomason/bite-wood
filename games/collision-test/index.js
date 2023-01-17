import { Game } from '../../core/game.js'
import { GameObject, GameRoom, gameRooms, gameState } from '../../core/index.js'
import { random } from '../../core/math.js'

const OBJECT_SIZE = 32

class Object extends GameObject {
  constructor() {
    super({
      // TODO: It is confusing that the config for bounding box is relative to the x,y position
      //       but the this.boundingBox* properties are abs positions in the room.
      //       Consider using the word "offset" in the config or something to differentiate the two.
      boundingBoxTop: -OBJECT_SIZE / 2,
      boundingBoxLeft: -OBJECT_SIZE / 2,
      boundingBoxWidth: OBJECT_SIZE,
      boundingBoxHeight: OBJECT_SIZE,
    })

    this.speed = 1
    this.direction = random(360)
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
for (let i = 0; i < 20; i += 1) {
  room.instanceCreate(
    Object,
    room.randomXPosition(OBJECT_SIZE, OBJECT_SIZE),
    room.randomYPosition(OBJECT_SIZE, OBJECT_SIZE),
  )
}

gameRooms.addRoom(room)

gameState.debug = true

const game = new Game()
game.start()

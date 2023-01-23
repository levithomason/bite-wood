import { Game } from '../../core/game.js'
import { gameMouse, GameObject, GameRoom, gameRooms } from '../../core/index.js'
import { direction, random, randomChoice, Vector } from '../../core/math.js'

const WIDTH = 800
const HEIGHT = 600

const BLOCK_INITIAL_COUNT = 64
const BLOCK_SPAWN_INTERVAL = (1000 / 60) * 3

const BLOCK_SPEED_SPAWN_MIN = 0.5
const BLOCK_SPEED_SPAWN_MAX = 1.5
const BLOCK_SPEED_MAX = 8

const BLOCK_COLLISION_FRICTION = 1

const BLOCK_SIZE_SPAWN_MIN = 4
const BLOCK_SIZE_SPAWN_MAX = 16
const BLOCK_SIZE_MIN = 2
const BLOCK_SIZE_MAX = 48

const stayInRoom = (object) => {
  if (object.boundingBoxLeft <= 0) {
    object.hspeed = Math.abs(object.hspeed)
  } else if (object.boundingBoxRight >= room.width) {
    object.hspeed = -Math.abs(object.hspeed)
  }

  if (object.boundingBoxTop <= 0) {
    object.vspeed = Math.abs(object.vspeed)
  } else if (object.boundingBoxBottom >= room.height) {
    object.vspeed = -Math.abs(object.vspeed)
  }
}

/**
 * @param {GameObject} a
 * @param {GameObject} b
 */
const bounceObjects = (a, b) => {
  const massA = Math.abs(a.size)
  const massB = Math.abs(b.size)

  a.hspeed =
    (a.hspeed * (massA - massB) + 2 * massB * b.hspeed) / (massA + massB)
  a.vspeed =
    (a.vspeed * (massA - massB) + 2 * massB * b.vspeed) / (massA + massB)

  b.hspeed =
    (b.hspeed * (massB - massA) + 2 * massA * a.hspeed) / (massA + massB)
  b.vspeed =
    (b.vspeed * (massB - massA) + 2 * massA * a.vspeed) / (massA + massB)
}

class Block extends GameObject {
  constructor() {
    super(
      (() => {
        const size =
          random(BLOCK_SIZE_SPAWN_MAX, BLOCK_SIZE_SPAWN_MIN) *
          (random() < 0.5 ? 1 : -1)

        const w = Math.abs(size)
        const h = Math.abs(size)

        return {
          speed: random(BLOCK_SPEED_SPAWN_MIN, BLOCK_SPEED_SPAWN_MAX),
          direction: random(360),

          boundingBoxTop: -h / 2,
          boundingBoxLeft: -w / 2,
          boundingBoxWidth: w,
          boundingBoxHeight: h,

          size,
        }
      })(),
    )
  }

  static spawn() {
    const side = randomChoice(['top', 'left', 'bottom', 'right'])

    // get random x and y values that are always outside the room
    let x
    let y

    switch (side) {
      case 'top':
        x = random(room.width)
        y = -BLOCK_SIZE_SPAWN_MAX
        break
      case 'left':
        x = -BLOCK_SIZE_SPAWN_MAX
        y = random(room.height)
        break
      case 'bottom':
        x = random(room.width)
        y = room.height + BLOCK_SIZE_SPAWN_MAX
        break
      case 'right':
        x = room.width + BLOCK_SIZE_SPAWN_MAX
        y = random(room.height)
        break
    }

    // always point into the room
    const inst = room.instanceCreate(Block, x, y)
    inst.direction = direction(
      x,
      y,
      room.randomXPosition(),
      room.randomYPosition(),
    )
  }

  onCollision(other) {
    if (other instanceof Block && Math.abs(this.size) > Math.abs(other.size)) {
      bounceObjects(this, other)
      // room.instanceDestroy(other)

      // apply friction
      this.speed *= BLOCK_COLLISION_FRICTION
      other.speed *= BLOCK_COLLISION_FRICTION

      // transfer size
      const percent = 0.33
      const exchange = Math.sqrt(Math.abs(other.size)) * percent
      this.size += exchange * Math.sign(other.size)
      other.size *= 1 - percent

      // limit speed
      this.speed = Math.min(this.speed, BLOCK_SPEED_MAX)

      if (this.size >= BLOCK_SIZE_MAX || this.size <= -BLOCK_SIZE_MAX) {
        const splits = 9
        const splitOffset = BLOCK_SIZE_MAX / Math.sqrt(splits)
        const splitSize = splitOffset * Math.sign(this.size) * 0.8
        const splitSpeed = BLOCK_SPEED_MAX

        const yTop = this.y - splitOffset
        const yBottom = this.y + splitOffset
        const xLeft = this.x - splitOffset
        const xRight = this.x + splitOffset

        const tl = room.instanceCreate(Block, xLeft, yTop)
        const tc = room.instanceCreate(Block, this.x, yTop)
        const tr = room.instanceCreate(Block, xRight, yTop)
        const ml = room.instanceCreate(Block, xLeft, this.y)
        const mc = room.instanceCreate(Block, this.x, this.y)
        const mr = room.instanceCreate(Block, xRight, this.y)
        const bl = room.instanceCreate(Block, xLeft, yBottom)
        const bc = room.instanceCreate(Block, this.x, yBottom)
        const br = room.instanceCreate(Block, xRight, yBottom)

        tl.size = splitSize
        tc.size = splitSize
        tr.size = splitSize
        ml.size = splitSize
        mc.size = splitSize
        mr.size = splitSize
        bl.size = splitSize
        bc.size = splitSize
        br.size = splitSize

        tl.speed = splitSpeed
        tc.speed = splitSpeed
        tr.speed = splitSpeed
        ml.speed = splitSpeed
        mc.speed = splitSpeed
        mr.speed = splitSpeed
        bl.speed = splitSpeed
        bc.speed = splitSpeed
        br.speed = splitSpeed

        tl.direction = 225
        tc.direction = 270
        tr.direction = 315
        ml.direction = 180
        mc.direction = this.direction
        mr.direction = 0
        bl.direction = 135
        bc.direction = 90
        br.direction = 45

        tl.motionAdd(this.direction, this.speed)
        tc.motionAdd(this.direction, this.speed)
        tr.motionAdd(this.direction, this.speed)
        ml.motionAdd(this.direction, this.speed)
        mc.motionAdd(this.direction, this.speed)
        mr.motionAdd(this.direction, this.speed)
        bl.motionAdd(this.direction, this.speed)
        bc.motionAdd(this.direction, this.speed)
        br.motionAdd(this.direction, this.speed)

        room.instanceDestroy(this)
        // room.instanceDestroy(other)
      }
    }
  }

  step() {
    super.step()
    if (this.size > -BLOCK_SIZE_MIN && this.size < BLOCK_SIZE_MIN) {
      room.instanceDestroy(this)
    }

    const absSize = Math.abs(this.size)
    this.boundingBoxTop = -absSize / 2
    this.boundingBoxLeft = -absSize / 2
    this.boundingBoxWidth = absSize
    this.boundingBoxHeight = absSize

    const x = this.x
    const y = this.y

    stayInRoom(this)

    // if staying in room changed position, we hit the wall
    // bounce off walls
    if (this.x !== x || this.y !== y) {
      this.speed *= BLOCK_COLLISION_FRICTION
    }
  }

  draw(drawing) {
    super.draw(drawing)

    drawing.setLineWidth(0)
    drawing.setStrokeColor('transparent')
    drawing.setFillColor(this.size > 0 ? '#3C3' : '#C33')
    drawing.rectangle(
      this.x - Math.abs(this.size / 2),
      this.y - Math.abs(this.size / 2),
      this.boundingBoxWidth,
      this.boundingBoxHeight,
    )
  }
}

const PLAYER_SIZE = 10
const PLAYER_SIZE_MIN = 2
class Player extends GameObject {
  constructor() {
    super({
      boundingBoxTop: -PLAYER_SIZE / 2,
      boundingBoxLeft: -PLAYER_SIZE / 2,
      boundingBoxHeight: PLAYER_SIZE,
      boundingBoxWidth: PLAYER_SIZE,
      size: PLAYER_SIZE,
    })
  }
  onCollision(other) {
    if (other instanceof Block) {
      this.size = Math.max(PLAYER_SIZE_MIN, this.size + other.size)
    }

    if (this.size < PLAYER_SIZE_MIN) {
      alert('Game Over!')
      location.reload()
    }

    gameRooms.currentRoom.instanceDestroy(other)
  }

  step() {
    this.x = gameMouse.x
    this.y = gameMouse.y

    this.boundingBoxTop = -this.size / 2
    this.boundingBoxLeft = -this.size / 2
    this.boundingBoxWidth = this.size
    this.boundingBoxHeight = this.size
  }

  draw(drawing) {
    super.draw(drawing)

    drawing.setLineWidth(0)
    drawing.setStrokeColor('transparent')
    drawing.setFillColor('#FF0')
    drawing.rectangle(
      this.x - this.boundingBoxWidth / 2,
      this.y - this.boundingBoxHeight / 2,
      this.boundingBoxWidth,
      this.boundingBoxHeight,
    )
  }
}

class Room extends GameRoom {
  constructor() {
    super(WIDTH, HEIGHT)
    this.backgroundColor = '#17171f'
  }
}

const room = new Room(WIDTH, HEIGHT)
// Block
for (let i = 0; i < BLOCK_INITIAL_COUNT; i += 1) {
  Block.spawn()
}
// Player
// room.instanceCreate(Player, WIDTH / 2, HEIGHT / 2)

setInterval(Block.spawn, BLOCK_SPAWN_INTERVAL)

gameRooms.addRoom(room)

const game = new Game({ width: WIDTH, height: HEIGHT })
game.start()

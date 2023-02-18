import { Game, GameObject, GameRoom, gameRooms } from '../../core/index.js'
import { direction, random, randomChoice } from '../../core/math.js'

const WIDTH = 800
const HEIGHT = 600

const BLOCK_INITIAL_COUNT = 20
const BLOCK_SPAWN_INTERVAL = (1000 / 60) * 16

const BLOCK_SPEED_SPAWN_MIN = 0.5
const BLOCK_SPEED_SPAWN_MAX = 1.5
const BLOCK_SPEED_MAX = 4

const BLOCK_COLLISION_FRICTION = 1

const BLOCK_SIZE_SPAWN_MIN = 16
const BLOCK_SIZE_SPAWN_MAX = 32
const BLOCK_SIZE_MIN = 2
const BLOCK_SIZE_MAX = 48

/**
 * @param {GameObject} a
 * @param {GameObject} b
 */
const bounceObjects = (a, b) => {
  const massA = Math.abs(a.size * a.size)
  const massB = Math.abs(b.size * b.size)

  const aHSpeed = a.hspeed
  const aVSpeed = a.vspeed

  const bHSpeed = b.hspeed
  const bVSpeed = b.vspeed

  a.hspeed = (aHSpeed * (massA - massB) + 2 * massB * bHSpeed) / (massA + massB)
  a.vspeed = (aVSpeed * (massA - massB) + 2 * massB * bVSpeed) / (massA + massB)

  b.hspeed = (bHSpeed * (massB - massA) + 2 * massA * aHSpeed) / (massA + massB)
  b.vspeed = (bVSpeed * (massB - massA) + 2 * massA * aVSpeed) / (massA + massB)
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
    if (!(other instanceof Block)) {
      return
    }

    // TODO: implement moving outside once collision line is done
    bounceObjects(this, other)

    // apply friction after collision
    this.speed *= BLOCK_COLLISION_FRICTION
    other.speed *= BLOCK_COLLISION_FRICTION

    // bigger block eats smaller block
    const winner = Math.abs(this.size) > Math.abs(other.size) ? this : other
    const loser = winner === this ? other : this
    winner.size += Math.sqrt(Math.abs(loser.size)) * Math.sign(loser.size)
    room.instanceDestroy(loser)
  }

  step() {
    super.step()
    if (this.size > -BLOCK_SIZE_MIN && this.size < BLOCK_SIZE_MIN) {
      room.instanceDestroy(this)
      return
    }

    // keep bounding box the same size as the block
    const absSize = Math.abs(this.size)
    this.boundingBoxTop = -absSize / 2
    this.boundingBoxLeft = -absSize / 2
    this.boundingBoxWidth = absSize
    this.boundingBoxHeight = absSize

    // stay in the room, bounce off walls with friction
    const x = this.x
    const y = this.y

    this.keepInRoom(1)

    if (this.x !== x || this.y !== y) {
      this.speed *= BLOCK_COLLISION_FRICTION
    }

    // limit speed
    this.speed = Math.min(this.speed, BLOCK_SPEED_MAX)

    // split if too big
    if (this.size >= BLOCK_SIZE_MAX || this.size <= -BLOCK_SIZE_MAX) {
      this.split()
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

  split() {
    const splits = 9
    const splitsPerRow = Math.sqrt(splits)
    const splitOffset = Math.abs(this.size) / splitsPerRow

    // slightly smaller than the offset to give some margin between blocks
    const splitSize = splitOffset * 0.8
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
  }
}

class Room extends GameRoom {
  constructor() {
    super(WIDTH, HEIGHT)
    this.backgroundColor = '#17171f'
  }
}

const room = new Room(WIDTH, HEIGHT)
gameRooms.addRoom(room)

// create blocks
for (let i = 0; i < BLOCK_INITIAL_COUNT; i += 1) {
  Block.spawn()
}
setInterval(Block.spawn, BLOCK_SPAWN_INTERVAL)

const game = new Game({ width: WIDTH, height: HEIGHT })
game.start()

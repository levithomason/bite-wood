import { offsetX, offsetY, random, Vector } from './math.js'
import { gameRooms } from './game-rooms.js'
import { GameObject } from './game-object.js'

class GameParticle {
  /**
   * @param {object} config
   * @param {number} config.x
   * @param {number} config.y
   * @param {string} config.color
   * @param {number} config.direction
   * @param {number} config.friction
   * @param {Vector} config.gravity
   * @param {number} config.life - Number of seconds to live
   * @param {'circle'|'square'|'line'} config.shape
   * @param {number} config.size
   * @param {number} config.speed
   */
  constructor({
    x,
    y,
    color,
    direction,
    friction,
    gravity,
    life,
    shape,
    size,
    speed,
  }) {
    this.x = x
    this.y = y
    this.color = color
    this.friction = friction
    this.gravity = gravity
    this.vector = new Vector(
      offsetX(0, speed, direction),
      offsetY(0, speed, direction),
    )
    this.shape = shape
    this.size = size
    this.timeToDie = Date.now() + life
  }

  step() {
    if (typeof this.friction !== 'undefined') {
      this.vector.magnitude *= 1 - this.friction
    }

    if (this.gravity) {
      this.vector.add(this.gravity.direction, this.gravity.magnitude)
    }

    // movement
    this.x = offsetX(this.x, this.vector.magnitude, this.vector.direction)
    this.y = offsetY(this.y, this.vector.magnitude, this.vector.direction)
  }

  draw(drawing) {
    switch (this.shape) {
      case 'circle':
        drawing.setFillColor(this.color)
        drawing.setStrokeColor('transparent')
        drawing.circle(this.x, this.y, this.size)
        break

      case 'square':
        drawing.setFillColor(this.color)
        drawing.setStrokeColor('transparent')
        drawing.rectangle(
          this.x - this.size / 2,
          this.y - this.size / 2,
          this.size,
          this.size,
        )
        break

      case 'line':
        const x2 = offsetX(this.x, this.size, this.vector.direction)
        const y2 = offsetY(this.y, this.size, this.vector.direction)
        drawing.setFillColor('transparent')
        drawing.setStrokeColor(this.color)
        drawing.setLineWidth(1)
        drawing.line(this.x, this.y, x2, y2)
        break

      default:
        break
    }
  }
}

export class GameParticles extends GameObject {
  /**
   * @param {object} [config]
   * @param {number} [config.x=0]
   * @param {number} [config.y=0]
   * @param {string} [config.color='#f0f'] - CSS color string
   * @param {number} [config.count=10] - Number of particles to create
   * @param {number} [config.directionEnd=360] - Start of the direction range
   * @param {number} [config.directionStart=0] - End of the direction range
   * @param {Vector} [config.gravity=new Vector(0, 0)] - Gravity vector applied to each particle
   * @param {number} [config.friction=0] - Friction applied to each particle
   * @param {number} [config.life=1000] - Number of seconds for each particle to live
   * @param {number} [config.rate=100] - Number of particles to create per millisecond
   * @param {string} [config.shape='circle'] - Shape of the particle
   * @param {number} [config.size=5] - Size of the particle
   * @param {number} [config.speed=5] - Speed of the particle
   * @param {number} [config.width=0] - Width of the emitter area
   * @param {number} [config.height=0] - Height of the emitter area
   *
   */
  constructor(config = {}) {
    super({ x: config.x, y: config.y })

    const {
      color = '#f0f',
      count = 10,
      directionEnd = 360,
      directionStart = 0,
      friction,
      gravity,
      life = 1000,
      rate = 100,
      shape = 'circle',
      size = 5,
      speed = 5,
      width = 0,
      height = 0,
    } = config

    this.color = color
    this.count = count
    this.directionEnd = directionEnd
    this.directionStart = directionStart
    this.friction = friction
    this.gravity = gravity
    this.life = life
    this.rate = rate
    this.shape = shape
    this.size = size
    this.width = width
    this.height = height
    this.speed = speed

    this.particles = []
    this.particlesCreated = 0
    this.lastParticleCreatedAt = Infinity
  }

  addParticle() {
    this.lastParticleCreatedAt = Date.now()
    this.particlesCreated += 1

    this.particles.push(
      new GameParticle({
        x: this.x - this.width / 2 + random(0, this.width),
        y: this.y - this.height / 2 + random(0, this.height),
        color: this.color,
        direction: random(this.directionStart, this.directionEnd),
        friction: this.friction,
        gravity: this.gravity,
        life: this.life,
        shape: this.shape,
        size: this.size,
        speed: this.speed,
      }),
    )
  }

  removeParticle(index) {
    this.particles.splice(index, 1)
  }

  step() {
    if (this.particlesCreated >= this.count && this.particles.length === 0) {
      gameRooms.currentRoom.instanceDestroy(this)
      return
    }

    const time = Date.now()

    if (this.particlesCreated < this.count) {
      const particlesToCreate =
        this.lastParticleCreatedAt === Infinity
          ? 1
          : Math.floor((time - this.lastParticleCreatedAt) / this.rate)

      for (
        let i = 0;
        i < particlesToCreate && this.particlesCreated < this.count;
        i++
      ) {
        this.addParticle()
      }
    }

    this.particles.forEach((particle, i) => {
      if (particle.timeToDie < time) {
        this.removeParticle(i)
      } else {
        particle.step()
      }
    })
  }

  draw(drawing) {
    super.draw(drawing)

    this.particles.forEach((particle) => {
      particle.draw(drawing)
    })
  }
}

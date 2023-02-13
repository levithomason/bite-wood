import { offsetX, offsetY, random } from './math.js'
import { gameRooms } from './game-rooms.js'
import { GameObject } from './game-object.js'

class GameParticle {
  /**
   * @param {object} config
   * @param {number} config.x
   * @param {number} config.y
   * @param {string} config.color
   * @param {number} config.direction
   * @param {number} config.life - Number of seconds to live
   * @param {'circle'|'line'} config.shape
   * @param {number} config.size
   * @param {number} config.speed
   */
  constructor({ x, y, color, direction, life, shape, size, speed }) {
    this.x = x
    this.y = y
    this.color = color
    this.size = size
    this.speed = speed
    this.direction = direction
    this.shape = shape
    this.timeToDie = Date.now() + life
  }

  step() {
    this.x = offsetX(this.x, this.speed, this.direction)
    this.y = offsetY(this.y, this.speed, this.direction)
  }

  draw(drawing) {
    drawing.setFillColor(this.color)
    drawing.setStrokeColor('transparent')

    switch (this.shape) {
      case 'circle':
        drawing.circle(this.x, this.y, this.size)
        break

      case 'line':
        const x2 = offsetX(this.x, this.speed, this.direction)
        const y2 = offsetY(this.y, this.speed, this.direction)
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
   * @param {number} [config.life=1000] - Number of seconds for each particle to live
   * @param {number} [config.rate=100] - Number of particles to create per millisecond
   * @param {string} [config.shape='circle'] - Shape of the particle
   * @param {number} [config.size=5] - Size of the particle
   * @param {number} [config.speed=5] - Speed of the particle
   */
  constructor(config = {}) {
    super({ x: config.x, y: config.y })

    const {
      color = '#f0f',
      count = 10,
      directionEnd = 360,
      directionStart = 0,
      life = 1000,
      rate = 100,
      shape = 'circle',
      size = 5,
      speed = 5,
    } = config

    this.color = color
    this.count = count
    this.directionEnd = directionEnd
    this.directionStart = directionStart
    this.life = life
    this.rate = rate
    this.shape = shape
    this.size = size
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
        x: this.x,
        y: this.y,
        color: this.color,
        direction: random(this.directionStart, this.directionEnd),
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

      for (let i = 0; i < particlesToCreate; i++) {
        if (this.particlesCreated <= this.count) {
          this.addParticle()
        }
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

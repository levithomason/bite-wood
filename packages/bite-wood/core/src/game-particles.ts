import { offsetX, offsetY, random } from './math.js'
import { Vector } from './vector.js'

import { gameRooms } from './game-rooms.js'
import { GameObject } from './game-object.js'
import { gameState } from './game-state-controller.js'
import { GameDrawing } from './game-drawing.js'

class GameParticle {
  x: number
  y: number
  color: string
  friction: number
  gravity: Vector
  vector: Vector
  shape: 'circle' | 'square' | 'line' | 'cross'
  size: number
  timeToLive: number

  constructor({
    x,
    y,
    color,
    direction,
    friction,
    gravity,
    timeToLive,
    shape,
    size,
    speed,
  }: {
    x: number
    y: number
    color: string
    direction: number
    friction: number
    gravity: Vector
    timeToLive: number
    shape: 'circle' | 'square' | 'line' | 'cross'
    size: number
    speed: number
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
    this.timeToLive = Date.now() + timeToLive
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

  draw(drawing: GameDrawing) {
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

export type EmitterConfig = {
  /** The x position of the emitter. */
  x: number

  /** The y position of the emitter. */
  y: number

  /** The width of the emitter. */
  width: number

  /** The height of the emitter. */
  height: number

  /** The end of the direction range to emit particles. */
  directionEnd: number

  /** The start of the direction range to emit particles. */
  directionStart: number

  /** Number of particles to create per millisecond. */
  rate: number

  /** Number of particles to create, after which the emitter will be destroyed. */
  count: number
}

export type ParticlesConfig = {
  /** The color of the particles. */
  color: GameParticle['color']

  /** The force applied to each particle as a Vector. */
  gravity: GameParticle['gravity']

  /** The friction applied to each particle's motion. */
  friction: GameParticle['friction']

  /** The number of milliseconds for each particle to live. */
  timeToLive: GameParticle['timeToLive']

  /** The shape of the particles. */
  shape: GameParticle['shape']

  /** The size of the particles. */
  size: GameParticle['size']

  /** The speed of the particles. */
  speed: number
}

export class GameParticles extends GameObject {
  particles: GameParticle[]
  particleConfig: ParticlesConfig
  emitterConfig: Omit<EmitterConfig, 'x' | 'y'>

  constructor({
    emitter,
    particles,
  }: {
    emitter: Partial<EmitterConfig>
    particles: Partial<ParticlesConfig>
  }) {
    const { x, y, ...emitterConfig } = emitter
    super({ x, y })

    this.emitterConfig = {
      width: 0,
      height: 0,
      directionEnd: 360,
      directionStart: 0,
      rate: 100,
      count: 10,
      ...emitterConfig,
    }

    this.particleConfig = {
      color: '#f0f',
      friction: 0,
      gravity: new Vector(0, 0),
      timeToLive: 1000,
      shape: 'circle',
      size: 5,
      speed: 5,
      ...particles,
    }

    this.particles = []
    this.particlesCreated = 0
    this.lastParticleCreatedAt = Infinity
  }

  addParticle() {
    this.lastParticleCreatedAt = Date.now()
    this.particlesCreated += 1

    this.particles.push(
      new GameParticle({
        x: this.x + random(0, this.emitterConfig.width),
        y: this.y + random(0, this.emitterConfig.height),
        color: this.particleConfig.color,
        direction: random(
          this.emitterConfig.directionStart,
          this.emitterConfig.directionEnd,
        ),
        friction: this.particleConfig.friction,
        gravity: this.particleConfig.gravity,
        timeToLive: this.particleConfig.timeToLive,
        shape: this.particleConfig.shape,
        size: this.particleConfig.size,
        speed: this.particleConfig.speed,
      }),
    )
  }

  removeParticle(index: number) {
    this.particles.splice(index, 1)
  }

  step() {
    if (
      this.particlesCreated >= this.emitterConfig.count &&
      this.particles.length === 0
    ) {
      gameRooms.currentRoom?.instanceDestroy(this)
      return
    }

    const time = Date.now()

    if (this.particlesCreated < this.emitterConfig.count) {
      const particlesToCreate =
        this.lastParticleCreatedAt === Infinity
          ? 1
          : Math.floor(
              (time - this.lastParticleCreatedAt) / this.emitterConfig.rate,
            )

      for (
        let i = 0;
        i < particlesToCreate &&
        this.particlesCreated < this.emitterConfig.count;
        i++
      ) {
        this.addParticle()
      }
    }

    this.particles.forEach((particle, i) => {
      if (particle.timeToLive < time) {
        this.removeParticle(i)
      } else {
        particle.step()
      }
    })
  }

  /**
   * Draw the particles.
   */
  draw(drawing: GameDrawing) {
    super.draw(drawing)

    this.particles.forEach((particle) => {
      particle.draw(drawing)
    })

    if (gameState.debug) {
      drawing.particlesDebug(this)
    }
  }
}

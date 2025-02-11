import { GameImage, GameObject, gamePhysics, GameSprite } from '@bite-wood/core'
import { Box } from './box.js'
import { SmokeParticles } from '../particles/smoke-particles.js'
import { BlastParticles } from '../particles/blast-particles.js'
import { room0 } from '../rooms/room0.js'
import { BarrelParticles } from '../particles/barrel-particles.js'

// =============================================================================
// Banana
// =============================================================================

const imgBanana = new GameImage('./sprites/banana.png')
await imgBanana.load()

const sprBanana = new GameSprite(imgBanana, {
  frameWidth: 8,
  frameHeight: 8,
  insertionX: 4,
  insertionY: 4,
  scaleX: 4,
  scaleY: 4,
})

export class Banana extends GameObject {
  constructor() {
    super({
      speed: 14,
      sprite: sprBanana,
      gravity: gamePhysics.gravity,
    })
  }

  onCollision(other: GameObject) {
    if (other.name === 'Box') {
      const barrelParticles = new BarrelParticles({
        directionStart: this.direction - 60,
        directionEnd: this.direction + 60,
        speed: this.speed * 0.5,
      })
      barrelParticles.x = other.x
      barrelParticles.y = other.y
      room0.objects.push(barrelParticles)

      room0.instanceCreate(
        SmokeParticles,
        other.x - other.boundingBoxWidth / 2,
        other.y - other.boundingBoxHeight / 2,
      )
      room0.instanceCreate(BlastParticles, other.x, other.y)
      room0.instanceDestroy(this)
      room0.instanceDestroy(other)

      if (room0.instanceCount(Box) === 0) {
        setTimeout(() => {
          window.location.reload()
        }, 1500)
      }
    }
  }

  step() {
    super.step()

    if (this.isOutsideRoom()) {
      room0.instanceDestroy(this)
      return
    }

    // apply gravity
    this.motionAdd(gamePhysics.gravity.direction, gamePhysics.gravity.magnitude)
  }
}

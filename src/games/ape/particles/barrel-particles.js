import { GameParticles } from '../../../core/index.js'
import { Vector } from '../../../core/math.js'

export class BarrelParticles extends GameParticles {
  constructor({ directionStart, directionEnd, speed }) {
    super({
      count: 3,
      life: 1500,
      speed,
      friction: 0.01,
      gravity: new Vector(0, 0.1),
      rate: 1,
      size: 8,
      directionStart,
      directionEnd,
      color: 'rgb(144, 113, 80)',
      shape: 'square',
    })
  }
}

import { GameParticles } from '../../../core/index.js'

export class BlastParticles extends GameParticles {
  constructor() {
    super({
      count: 5,
      life: 500,
      speed: 4,
      friction: 0.1,
      rate: 1,
      size: 24,
      color: '#fff',
      shape: 'line',
    })
  }
}

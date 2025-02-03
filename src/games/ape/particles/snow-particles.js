import { GameParticles } from '../../../core/index.js'

export class SnowParticles extends GameParticles {
  constructor() {
    super({
      count: Infinity,
      life: 11000,
      speed: 1,
      rate: 100,
      directionStart: 90 - 5,
      directionEnd: 90 + 5,
      size: 3,
      width: 800,
      color: '#fff',
      shape: 'circle',
    })
  }
}

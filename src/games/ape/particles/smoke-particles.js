import { GameParticles } from '../../../core/index.js'

export class SmokeParticles extends GameParticles {
  constructor() {
    super({
      count: 20,
      life: 1000,
      speed: 0.25,
      rate: 1,
      size: 12,
      width: 32,
      height: 32,
      color: 'rgba(57,64,65,0.04)',
      shape: 'circle',
    })
  }
}

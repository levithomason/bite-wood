import { GameParticles } from '@bite-wood/core'

export class BlastParticles extends GameParticles {
  constructor() {
    super({
      emitter: {
        count: 5,
        rate: 1,
      },
      particles: {
        timeToLive: 500,
        speed: 4,
        friction: 0.1,
        size: 24,
        color: '#fff',
        shape: 'line',
      },
    })
  }
}

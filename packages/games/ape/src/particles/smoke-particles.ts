import { GameParticles } from '@bite-wood/core'

export class SmokeParticles extends GameParticles {
  constructor() {
    super({
      emitter: {
        count: 20,
        rate: 1,
        width: 32,
        height: 32,
      },
      particles: {
        timeToLive: 1000,
        speed: 0.25,
        size: 12,
        color: 'rgba(57,64,65,0.04)',
        shape: 'circle',
      },
    })
  }
}

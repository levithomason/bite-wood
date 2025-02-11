import { GameParticles } from '@bite-wood/core'

export class SnowParticles extends GameParticles {
  constructor() {
    super({
      emitter: {
        count: Infinity,
        rate: 100,
        directionStart: 90 - 5,
        directionEnd: 90 + 5,
        // gets set to the room width
        width: 800,
      },
      particles: {
        timeToLive: 13500,
        speed: 1,
        size: 3,
        color: '#fff',
        shape: 'circle',
      },
    })
  }
}

import {
  EmitterConfig,
  GameParticles,
  ParticlesConfig,
  Vector,
} from '@bite-wood/core'

type BarrelParticlesConfig = {
  directionStart: EmitterConfig['directionStart']
  directionEnd: EmitterConfig['directionEnd']
  speed: ParticlesConfig['speed']
}

export class BarrelParticles extends GameParticles {
  constructor({ directionStart, directionEnd, speed }: BarrelParticlesConfig) {
    super({
      emitter: {
        count: 3,
        rate: 1,
        directionStart,
        directionEnd,
      },
      particles: {
        speed,
        friction: 0.01,
        gravity: new Vector(0, 0.1),
        size: 8,
        color: 'rgb(144, 113, 80)',
        shape: 'square',
      },
    })
  }
}

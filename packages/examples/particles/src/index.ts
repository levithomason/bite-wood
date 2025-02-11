import { Game, GameParticles, GameRoom, gameRooms } from '@bite-wood/core'

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// =============================================================================
// Particles
// =============================================================================

class BlastParticles extends GameParticles {
  constructor() {
    super({
      emitter: {
        count: 5,
        rate: 0,
      },
      particles: {
        timeToLive: 500,
        speed: 4,
        friction: 0.1,
        size: 32,
        color: '#ffffffcc',
        shape: 'line',
      },
    })
  }
}

class SmokeParticles extends GameParticles {
  constructor() {
    super({
      emitter: {
        count: 4,
        rate: 30,
        width: 16,
        height: 16,
      },
      particles: {
        timeToLive: 800,
        speed: 0.5,
        friction: 0.005,
        size: 16,
        color: '#33333322',
        shape: 'circle',
      },
    })
  }
}

// =============================================================================
// Room
// =============================================================================

class Room extends GameRoom {
  constructor() {
    super({ width: 800, height: 600 })
    this.backgroundColor = '#4c7885'
  }
}

const room = new Room()
gameRooms.addRoom(room)

// =============================================================================
// Game
// =============================================================================
const game = new Game()
game.start()

while (true) {
  const x = room.randomXPosition(100, 100)
  const y = room.randomYPosition(100, 100)

  room.instanceCreate(BlastParticles, x, y)
  room.instanceCreate(SmokeParticles, x, y)

  await sleep(1000)
}

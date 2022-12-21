import { Vector } from './math.js'

class GamePhysics {
  constructor() {
    this.DIRECTION_UP = 270
    this.DIRECTION_DOWN = 90
    this.DIRECTION_LEFT = 180
    this.DIRECTION_RIGHT = 0

    this.gravity = new Vector(this.DIRECTION_DOWN, 0.4)
    this.terminalVelocity = 15

    this.friction = 0.2
  }
}

export const gamePhysics = new GamePhysics()
window.biteWood = window.biteWood || {}
window.biteWood.gamePhysics = gamePhysics

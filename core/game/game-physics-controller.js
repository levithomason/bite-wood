import * as utils from '../math.js'

class GamePhysics {
  constructor() {
    this.DIRECTION_UP = 270
    this.DIRECTION_DOWN = 90
    this.DIRECTION_LEFT = 180
    this.DIRECTION_RIGHT = 0

    this.gravity = new utils.Vector(this.DIRECTION_DOWN, 0.4)
    this.terminalVelocity = 15

    this.friction = 0.3
  }
}

export const gamePhysics = new GamePhysics()
window.biteWood = window.biteWood || {}
window.biteWood.gamePhysics = gamePhysics

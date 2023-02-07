import { Vector } from './math.js'

export class GamePhysics {
  constructor() {
    this.DIRECTION_RIGHT = 0
    this.DIRECTION_DOWN = 90
    this.DIRECTION_LEFT = 180
    this.DIRECTION_UP = 270

    this.gravity = new Vector(this.DIRECTION_DOWN, 0.4)
    this.terminalVelocity = 15

    this.friction = 0.2
  }
}

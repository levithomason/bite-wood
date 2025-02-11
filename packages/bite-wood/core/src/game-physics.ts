import { Vector } from './vector.js'

export class GamePhysics {
  DIRECTION_RIGHT: number
  DIRECTION_DOWN: number
  DIRECTION_LEFT: number
  DIRECTION_UP: number

  gravity: Vector
  terminalVelocity: number

  friction: number

  constructor() {
    this.DIRECTION_RIGHT = 0
    this.DIRECTION_DOWN = 90
    this.DIRECTION_LEFT = 180
    this.DIRECTION_UP = 270

    this.gravity = new Vector(0, 0.4)
    this.terminalVelocity = 15

    this.friction = 0.2
  }
}

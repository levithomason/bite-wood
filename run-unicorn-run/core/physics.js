import * as utils from './utils.js'

export class Vector {
  constructor(direction = 0, magnitude = 0) {
    this._angle = utils.toRadians(direction)
    this._hypotenuse = magnitude
    this._adjacent = this._hypotenuse * Math.cos(this._angle)
    this._opposite = this._hypotenuse * Math.sin(this._angle)

    this.add = this.add.bind(this)
  }

  get direction() {
    return utils.toDegrees(this._angle)
  }

  set direction(direction) {
    this._angle = utils.toRadians(direction)
    this._adjacent = this._hypotenuse * Math.cos(this._angle)
    this._opposite = this._hypotenuse * Math.sin(this._angle)
  }

  get magnitude() {
    return this._hypotenuse
  }

  set magnitude(hypotenuse) {
    this._hypotenuse = hypotenuse
    this._adjacent = this._hypotenuse * Math.cos(this._angle)
    this._opposite = this._hypotenuse * Math.sin(this._angle)
  }

  get x() {
    return this._adjacent
  }

  set x(adjacent) {
    this._adjacent = adjacent
    this._angle = Math.atan2(this._opposite, this._adjacent)
    this._hypotenuse = utils.distance(this.x, this.y)
  }

  get y() {
    return this._opposite
  }

  set y(opposite) {
    this._opposite = opposite
    this._angle = Math.atan2(this._opposite, this._adjacent)
    this._hypotenuse = utils.distance(this.x, this.y)
  }

  add(direction, magnitude) {
    const vector = new Vector(direction, magnitude)

    this.x += vector.x
    this.y += vector.y
  }
}

const physics = {
  DIRECTION_UP: 270,
  DIRECTION_DOWN: 90,
  DIRECTION_LEFT: 180,
  DIRECTION_RIGHT: 0,

  gravity: new Vector(90, 0.4),
  terminalVelocity: 15,

  friction: 0.3,
}

window.physics = physics

export default physics

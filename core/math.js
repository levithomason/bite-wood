export const toDegrees = radians => (radians * 180) / Math.PI

export const toRadians = degrees => (degrees * Math.PI) / 180

export const distance = (x1, y1, x2 = 0, y2 = 0) => {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
}

export const direction = (x1, y1, x2 = 0, y2 = 0) => {
  return toDegrees(Math.atan2(y2 - y1, x2 - x1))
}

export const clamp = (val, min, max) => {
  return Math.max(min, Math.min(max, val))
}

export const random = (max = 1, min = 0) => {
  return (max - min) * Math.random() + min
}

/**
 * Returns true if `val` is greater than or equal to `lower` and less than `upper`.
 * @param {number} val
 * @param {number} lower
 * @param {number} upper
 * @return {boolean}
 */
export const inRange = (val, lower, upper) => {
  return val >= lower && val < upper
}

export class Vector {
  constructor(direction = 0, magnitude = 0) {
    this._angle = toRadians(direction)
    this._hypotenuse = magnitude
    this._adjacent = this._hypotenuse * Math.cos(this._angle)
    this._opposite = this._hypotenuse * Math.sin(this._angle)

    this.add = this.add.bind(this)
  }

  get direction() {
    return toDegrees(this._angle)
  }

  set direction(direction) {
    this._angle = toRadians(direction)
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
    this._hypotenuse = distance(this.x, this.y)
  }

  get y() {
    return this._opposite
  }

  set y(opposite) {
    this._opposite = opposite
    this._angle = Math.atan2(this._opposite, this._adjacent)
    this._hypotenuse = distance(this.x, this.y)
  }

  add(direction, magnitude) {
    const vector = new Vector(direction, magnitude)

    this.x += vector.x
    this.y += vector.y
  }
}

export const toDegrees = radians => (radians * 180) / Math.PI

export const toRadians = degrees => (degrees * Math.PI) / 180

export const distance = (x1, y1, x2 = 0, y2 = 0) => {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
}

export const direction = (x1, y1, x2 = 0, y2 = 0) => {
  return toDegrees(Math.atan2(y2 - y1, x2 - x1))
}

/**
 * Returns `min` when `val` is less than `min` and `max` when `val` is greater than `max.
 * @param val
 * @param min
 * @param max
 * @return {number}
 */
export const clamp = (val, min, max) => {
  return Math.max(min, Math.min(max, val))
}

/**
 * Returns a random number between `max` and `min`.
 * @param {number} [max=1]
 * @param {number} [min=0]
 * @return {number}
 */
export const random = (max = 1, min = 0) => {
  return (max - min) * Math.random() + min
}

/**
 * Returns 0 when `val <= min` and 1 when `val >= max`.
 * @param {number} val
 * @param {number} min
 * @param {number} max
 * @return {number}
 */
export const normalize = (val, min, max) => {
  return clamp((val - min) / (max - min), 0, 1)
}

/**
 * Scales the `val` from the range o1-o2 to n1-n2. Returns a number clamped to n1-n2.
 * @param {number} val - The current value
 * @param {number} min - The original lower bound
 * @param {number} max - The original upper bound
 * @param {number} newMin - The new lower bound
 * @param {number} newMax - The new upper bound
 * @return {number}
 */
export const scale = (val, min, max, newMin, newMax) => {
  const percent = normalize(val, min, max)
  const newRange = newMax - newMin
  return newMin + newRange * percent
}

/**
 * Returns a new x value based on a starting x, distance, and direction.
 * @param {number} startX
 * @param {number} distance
 * @param {number} direction - In degrees.
 * @return {number}
 */
export const offsetX = (startX, distance, direction) => {
  return startX + distance * Math.cos(toRadians(direction))
}

/**
 * Returns a new x value based on a starting x, distance, and direction.
 * @param {number} startY
 * @param {number} distance
 * @param {number} direction - In degrees.
 * @return {number}
 */
export const offsetY = (startY, distance, direction) => {
  return startY + distance * Math.sin(toRadians(direction))
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

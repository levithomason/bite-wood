const radToDegMul = 180 / Math.PI
const degToRadMul = Math.PI / 180

/**
 * Converts radians to degrees and returns a value between 0 and 360.
 * @param {number} radians
 * @return {number}
 */
export const toDegrees = (radians) => (radians * radToDegMul + 360) % 360

export const toRadians = (degrees) => degrees * degToRadMul

export const distance = (x1, y1, x2 = 0, y2 = 0) => {
  const x = x2 - x1
  const y = y2 - y1
  return Math.sqrt(x * x + y * y)
}

export const direction = (x1, y1, x2 = 0, y2 = 0) => {
  return toDegrees(Math.atan2(y2 - y1, x2 - x1))
}

/**
 * Returns the sum of an array of values.
 * @param {number[]} values - An array of numbers
 * @return {number}
 */
export const sum = (values) => values.reduce((a = 0, b = 0) => a + b, 0)

/**
 * Returns the average of an array of values.
 * @param {number[]} values - An array of numbers
 * @return {number}
 */
export const avg = (values) => sum(values) / values.length

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
 * Returns a random item from an array.
 * @param {*[]} array
 * @return {number}
 */
export const randomChoice = (array) => {
  return array[Math.floor(random(array.length))]
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
  constructor(x = 0, y = 0) {
    this.x = x
    this.y = y

    this.add = this.add.bind(this)
  }

  #setXY(angle, magnitude) {
    this.x = magnitude * Math.cos(angle)
    this.y = magnitude * Math.sin(angle)
  }

  /**
   * The angle of the vector in radians.
   * @type {number}
   */
  get angle() {
    return Math.atan2(this.y, this.x)
  }

  set angle(angle) {
    this.#setXY(angle, this.magnitude)
  }

  /**
   * The direction of the vector in degrees.
   * @type {number}
   */
  get direction() {
    return toDegrees(this.angle)
  }

  set direction(val) {
    this.angle = toRadians(val)
  }

  /**
   * The magnitude (i.e. length) of the vector.
   * @type {number}
   */
  get magnitude() {
    return distance(this.x, this.y)
  }

  set magnitude(magnitude) {
    this.#setXY(this.angle, magnitude)
  }

  /**
   * Add direction and magnitude to the vector.
   * @param {number} direction
   * @param {number} magnitude
   */
  add(direction, magnitude) {
    this.x += offsetX(0, magnitude, direction)
    this.y += offsetY(0, magnitude, direction)
  }
}

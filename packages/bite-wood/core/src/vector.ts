import { distance, offsetX, offsetY, toDegrees, toRadians } from './math.js'

export class Vector {
  x: number
  y: number

  constructor(x = 0, y = 0) {
    this.x = x
    this.y = y

    this.add = this.add.bind(this)
  }

  #setXY(angle: number, magnitude: number) {
    this.x = magnitude * Math.cos(angle)
    this.y = magnitude * Math.sin(angle)
  }

  /**
   * The angle of the vector in radians.
   */
  get angle(): number {
    return Math.atan2(this.y, this.x)
  }

  set angle(angle: number) {
    this.#setXY(angle, this.magnitude)
  }

  /**
   * The direction of the vector in degrees.
   */
  get direction(): number {
    return toDegrees(this.angle)
  }

  set direction(val) {
    this.angle = toRadians(val)
  }

  /**
   * The magnitude (i.e. length) of the vector.
   */
  get magnitude(): number {
    return distance(this.x, this.y)
  }

  set magnitude(magnitude) {
    this.#setXY(this.angle, magnitude)
  }

  /**
   * Add direction and magnitude to the vector.
   * @param direction
   * @param magnitude
   */
  add(direction: number, magnitude: number) {
    this.x += offsetX(0, magnitude, direction)
    this.y += offsetY(0, magnitude, direction)
  }
}

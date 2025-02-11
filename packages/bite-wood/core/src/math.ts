const radToDegMul = 180 / Math.PI
const degToRadMul = Math.PI / 180

/**
 * Converts radians to degrees and returns a value between 0 and 360.
 * @param radians
 */
export const toDegrees = (radians: number) => {
  return (radians * radToDegMul + 360) % 360
}

/**
 * Converts degrees to radians.
 * @param degrees
 */
export const toRadians = (degrees: number) => {
  return degrees * degToRadMul
}

export const distance = (x1: number, y1: number, x2 = 0, y2 = 0) => {
  const x = x2 - x1
  const y = y2 - y1
  return Math.sqrt(x * x + y * y)
}

/**
 * Returns the angle between two points in degrees.
 * If a second point is not provided, the angle is calculated from the origin.
 * @param x1
 * @param y1
 * @param x2
 * @param y2
 */
export const direction = (
  x1: number,
  y1: number,
  x2: number = 0,
  y2: number = 0,
) => {
  return toDegrees(Math.atan2(y2 - y1, x2 - x1))
}

/**
 * Returns the sum of an array of values.
 * @param values - An array of numbers
 */
export const sum = (values: number[]) => {
  return values.reduce((a = 0, b = 0) => a + b, 0)
}

/**
 * Returns the average of an array of values.
 * @param values - An array of numbers
 */
export const avg = (values: number[]) => {
  if (!values.length) return 0

  return sum(values) / values.length
}

/**
 * Returns `min` when `val` is less than `min` and `max` when `val` is greater than `max.
 * @param val
 * @param min
 * @param max
 */
export const clamp = (val: number, min: number, max: number) => {
  return Math.max(min, Math.min(max, val))
}

/**
 * Returns a random number between `max` and `min`.
 * @param [max=1]
 * @param [min=0]
 */
export const random = (max: number = 1, min: number = 0) => {
  return (max - min) * Math.random() + min
}

/**
 * Returns a random item from an array.
 * @param array
 */
export const randomChoice = (array: any[]) => {
  return array[Math.floor(random(array.length))]
}

/**
 * Normalizes a value between `min` and `max`.
 * Returns 0 when `val <= min` and 1 when `val >= max`.
 * @param val
 * @param min
 * @param max
 */
export const normalize = (val: number, min: number, max: number) => {
  // TODO: shouldn't this clamp the value to min/max instead of 0 1?
  return clamp((val - min) / (max - min), 0, 1)
}

/**
 * Scales the `val` from the range min-max to newMin-newMax. Returns a number clamped to the new range.
 * @param val - The current value
 * @param min - The original lower bound
 * @param max - The original upper bound
 * @param newMin - The new lower bound
 * @param newMax - The new upper bound
 */
export const scale = (
  val: number,
  min: number,
  max: number,
  newMin: number,
  newMax: number,
) => {
  const percent = normalize(val, min, max)
  const newRange = newMax - newMin
  return newMin + newRange * percent
}

/**
 * Returns a new x value based on a starting x, distance, and direction.
 * @param startX
 * @param distance
 * @param direction - In degrees.
 */
export const offsetX = (
  startX: number,
  distance: number,
  direction: number,
) => {
  return startX + distance * Math.cos(toRadians(direction))
}

/**
 * Returns a new x value based on a starting x, distance, and direction.
 * @param startY
 * @param distance
 * @param direction - In degrees.
 */
export const offsetY = (
  startY: number,
  distance: number,
  direction: number,
) => {
  return startY + distance * Math.sin(toRadians(direction))
}

/**
 * Returns true if `val` is greater than or equal to `lower` and less than `upper`.
 * @param val
 * @param lower
 * @param upper
 */
export const inRange = (val: number, lower: number, upper: number): boolean => {
  return val >= lower && val < upper
}

import state from './state.js'

/**
 * Checks if a point is colliding with an object.
 * @param {number} x
 * @param {number} y
 * @param {GameObject} object
 * @returns {boolean}
 */
export const point = (x, y, object) => {
  return (
    x >= object.boundingBoxLeft &&
    x <= object.boundingBoxRight &&
    y >= object.boundingBoxTop &&
    y <= object.boundingBoxBottom
  )
}

/**
 * Checks if an object is colliding with some other object.
 * @param {GameObject} object
 * @param {GameObject} other
 * @returns {boolean}
 */
export const objects = (object, other = null) => {
  return state.room.objects.some(b => {
    if (object === b) return false
    if (other && other.constructor === b.constructor) return false

    const hasXIntersection =
      object.boundingBoxRight >= b.boundingBoxLeft &&
      object.boundingBoxLeft <= b.boundingBoxRight

    const hasYIntersection =
      object.boundingBoxBottom >= b.boundingBoxTop &&
      object.boundingBoxTop <= b.boundingBoxBottom

    return hasXIntersection && hasYIntersection
  })
}

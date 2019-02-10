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
 * @param {'any'|'solid'|GameObject} other
 * @returns {boolean}
 */
export const objects = (object, other) => {
  return state.room.objects.some(b => {
    // TODO: introduce object ids so as not to rely on instance equality, could be over network
    if (object === b) return false

    if (other === 'solid' && !b.solid) return false

    if (other.displayName && other.displayName !== b.displayName) return false

    const hasXIntersection =
      object.boundingBoxRight >= b.boundingBoxLeft &&
      object.boundingBoxLeft <= b.boundingBoxRight

    const hasYIntersection =
      object.boundingBoxBottom >= b.boundingBoxTop &&
      object.boundingBoxTop <= b.boundingBoxBottom

    return hasXIntersection && hasYIntersection
  })
}

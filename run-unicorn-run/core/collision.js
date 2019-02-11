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
 * @param {GameObject} self
 * @param {'any'|'solid'|string|GameObject} other - If string, object display name.
 * @returns {boolean}
 */
export const objects = (self, other) => {
  const withAny = other === 'any'
  const withSolid = other === 'solid'
  const displayName = other.displayName || other

  return state.room.objects.some(object => {
    // TODO: introduce object ids so as not to rely on instance equality, could be over network
    if (self === object) return false
    if (withSolid && !object.solid) return false
    if (displayName !== object.displayName) return false

    const hasXIntersection =
      self.boundingBoxRight >= object.boundingBoxLeft &&
      self.boundingBoxLeft <= object.boundingBoxRight

    const hasYIntersection =
      self.boundingBoxBottom >= object.boundingBoxTop &&
      self.boundingBoxTop <= object.boundingBoxBottom

    return hasXIntersection && hasYIntersection
  })
}

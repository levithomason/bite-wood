/**
 * @param {number} x
 * @param {number} y
 * @param {GameObject} object
 * @returns {boolean}
 */
export const point = (x, y, object) => {
  return (
    x > object.boundingBoxLeft &&
    x < object.boundingBoxRight &&
    y > object.boundingBoxTop &&
    y < object.boundingBoxBottom
  )
}

/**
 * @param {GameObject} a
 * @param {GameObject} b
 * @returns {boolean}
 */
export const objects = (a, b) => {
  const hasXIntersection =
    a.boundingBoxRight > b.boundingBoxLeft &&
    a.boundingBoxLeft < b.boundingBoxRight

  const hasYIntersection =
    a.boundingBoxBottom > b.boundingBoxTop &&
    a.boundingBoxTop < b.boundingBoxBottom

  return hasXIntersection && hasYIntersection
}

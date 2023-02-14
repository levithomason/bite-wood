import { gameRooms } from './game-rooms.js'

/**
 * Checks if a point is colliding with a rectangle.
 * @param {number} x - The x position of the point.
 * @param {number} y - The y position of the point.
 * @param {number} x1 - The x1 of the rectangle.
 * @param {number} y1 - The y1 of the rectangle.
 * @param {number} x2 - The x2 of the rectangle.
 * @param {number} y2 - The y2 of the rectangle.
 * @returns {boolean}
 */
export const collisionPointRectangle = (x, y, x1, y1, x2, y2) => {
  return (
    x >= Math.min(x1, x2) &&
    x <= Math.max(x1, x2) &&
    y >= Math.min(y1, y2) &&
    y <= Math.max(y1, y2)
  )
}

/**
 * Checks if the top side of an object is colliding with some other object.
 * @param {GameObject} self
 * @param {GameObject} other
 * @returns {boolean}
 */
export const onTop = (self, other) => {
  return (
    self.boundingBoxTop <= other.boundingBoxBottom &&
    self.boundingBoxTop >= other.boundingBoxTop
  )
}
/**
 * Checks if the bottom side of an object is colliding with some other object.
 * @param {GameObject} self
 * @param {GameObject} other
 * @returns {boolean}
 */
export const onBottom = (self, other) => {
  return (
    self.boundingBoxBottom >= other.boundingBoxTop &&
    self.boundingBoxBottom <= other.boundingBoxBottom
  )
}
/**
 * Checks if the left side of an object is colliding with some other object.
 * @param {GameObject} self
 * @param {GameObject} other
 * @returns {boolean}
 */
export const onLeft = (self, other) => {
  return (
    self.boundingBoxLeft <= other.boundingBoxRight &&
    self.boundingBoxLeft >= other.boundingBoxLeft
  )
}
/**
 * Checks if the right side of an object is colliding with some other object.
 * @param {GameObject} self
 * @param {GameObject} other
 * @returns {boolean}
 */
export const onRight = (self, other) => {
  return (
    self.boundingBoxRight >= other.boundingBoxLeft &&
    self.boundingBoxRight <= other.boundingBoxRight
  )
}

/**
 * List of tuples of objects that are currently colliding.
 * @type {[GameObject, GameObject][]}
 */
const _activeCollisions = []

/**
 * Calculates collisions between all `objects`, calls their `onCollision` methods,
 * and
 * @param {GameObject[]} objects
 */
export const handleCollisions = (objects) => {
  // clear active collisions
  _activeCollisions.length = 0

  const visited = new Set()

  objects.forEach((self) => {
    // track visited objects, so we don't check collisions twice
    // this also prevents:
    // 1. adding duplicate collisions to the _activeCollisions list
    // 2. colliding with self
    visited.add(self)

    objects.forEach((other) => {
      if (visited.has(other)) return

      // Simple check for overlapping AABB
      if (
        self.boundingBoxRight >= other.boundingBoxLeft &&
        self.boundingBoxLeft <= other.boundingBoxRight &&
        self.boundingBoxBottom >= other.boundingBoxTop &&
        self.boundingBoxTop <= other.boundingBoxBottom
      ) {
        _activeCollisions.push([self, other])
      }
    })
  })

  // TODO: resolve dynamic to static
  // TODO: resolve dynamic to dynamic

  // call user code for collisions
  _activeCollisions.forEach(([objectA, objectB]) => {
    objectA.onCollision(objectB)
    objectB.onCollision(objectA)
  })
}

/**
 * Returns true if the object is colliding with some other object.
 * Use the callback to define custom logic for determining if a collision has occurred.
 *
 * @example
 * // Check if the player is colliding with any object
 * if (isColliding(player)) { ... }
 *
 * // Check if the player is colliding with a specific class of object
 * if (isColliding(player, CoinClass)) { ... }
 *
 * @param {GameObject} self
 * @param {GameObject|undefined} [other] - A game object to check collisions against
 * or a callback that returns true if the collision is valid.
 * @returns {boolean}
 */
export const isColliding = (self, other) => {
  return _activeCollisions.some(([a, b]) => {
    if (a === self) return !other || b instanceof other
    if (b === self) return !other || a instanceof other
  })
}

import { gameRooms } from './game-rooms.js'

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
export const activeCollisions = []

export const handleCollisions = () => {
  // clear active collisions
  activeCollisions.length = 0

  const { objects } = gameRooms.currentRoom

  const visited = new Set()

  objects.forEach((self) => {
    // track visited objects, so we don't check collisions twice
    // this also prevents:
    // 1. adding duplicate collisions to the activeCollisions list
    // 2. colliding with self
    visited.add(self)

    objects.forEach((other) => {
      if (visited.has(other)) return

      if (
        self.boundingBoxRight >= other.boundingBoxLeft &&
        self.boundingBoxLeft <= other.boundingBoxRight &&
        self.boundingBoxBottom >= other.boundingBoxTop &&
        self.boundingBoxTop <= other.boundingBoxBottom
      ) {
        activeCollisions.push([self, other])
      }
    })
  })

  // TODO: resolve dynamic to static
  // TODO: resolve dynamic to dynamic

  // call user code for collisions
  activeCollisions.forEach(([objectA, objectB]) => {
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
  return activeCollisions.some(([a, b]) => {
    if (a === self) return !other || b instanceof other
    if (b === self) return !other || a instanceof other
  })
}

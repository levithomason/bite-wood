import { GameObject } from './game-object.js'

/**
 * Checks if a point is colliding with a rectangle.
 * @param x - The x position of the point.
 * @param y - The y position of the point.
 * @param x1 - The x1 of the rectangle.
 * @param y1 - The y1 of the rectangle.
 * @param x2 - The x2 of the rectangle.
 * @param y2 - The y2 of the rectangle.
 */
export const collisionPointRectangle = (
  x: number,
  y: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): boolean =>
  x >= Math.min(x1, x2) &&
  x <= Math.max(x1, x2) &&
  y >= Math.min(y1, y2) &&
  y <= Math.max(y1, y2)

/**
 * Checks if the top side of an object is colliding with some other object.
 * @param self
 * @param other
 */
export const onTop = (self: GameObject, other: GameObject): boolean =>
  self.boundingBoxTop <= other.boundingBoxBottom &&
  self.boundingBoxTop >= other.boundingBoxTop

/**
 * Checks if the bottom side of an object is colliding with some other object.
 * @param self
 * @param other
 */
export const onBottom = (self: GameObject, other: GameObject): boolean =>
  self.boundingBoxBottom >= other.boundingBoxTop &&
  self.boundingBoxBottom <= other.boundingBoxBottom

/**
 * Checks if the left side of an object is colliding with some other object.
 * @param self
 * @param other
 */
export const onLeft = (self: GameObject, other: GameObject): boolean =>
  self.boundingBoxLeft <= other.boundingBoxRight &&
  self.boundingBoxLeft >= other.boundingBoxLeft

/**
 * Checks if the right side of an object is colliding with some other object.
 * @param self
 * @param other
 */
export const onRight = (self: GameObject, other: GameObject): boolean =>
  self.boundingBoxRight >= other.boundingBoxLeft &&
  self.boundingBoxRight <= other.boundingBoxRight

/**
 * List of tuples of objects that are currently colliding.
 */
const _activeCollisions: [GameObject, GameObject][] = []

/**
 * Calculates collisions between all `objects`, calls their `onCollision` methods,
 * and
 * @param objects
 */
export const handleCollisions = (objects: GameObject[]) => {
  // clear active collisions
  _activeCollisions.length = 0

  const visited = new Set()

  for (const self of objects) {
    // track visited objects, so we don't check collisions twice
    // this also prevents:
    // 1. adding duplicate collisions to the _activeCollisions list
    // 2. colliding with self
    visited.add(self)

    for (const other of objects) {
      if (visited.has(other)) continue

      // Simple check for overlapping AABB
      if (
        self.boundingBoxRight >= other.boundingBoxLeft &&
        self.boundingBoxLeft <= other.boundingBoxRight &&
        self.boundingBoxBottom >= other.boundingBoxTop &&
        self.boundingBoxTop <= other.boundingBoxBottom
      ) {
        _activeCollisions.push([self, other])
      }
    }
  }

  // TODO: resolve dynamic to static
  // TODO: resolve dynamic to dynamic

  for (const [objectA, objectB] of _activeCollisions) {
    // call user code for collisions
    objectA.onCollision(objectB)
    objectB.onCollision(objectA)
  }
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
 * @param self
 * @param [other] - A game object to check collisions against
 */
export const isColliding = (
  self: GameObject,
  other?: GameObject | typeof GameObject,
): boolean => {
  // if no `other` was specified, any collision involving `self` is valid
  // otherwise, we check for collisions with another specific instance or class
  for (const [a, b] of _activeCollisions) {
    if (a === self) {
      return (
        !other ||
        b === other ||
        (typeof other === 'function' && b instanceof other)
      )
    }

    if (b === self) {
      return (
        !other ||
        a === other ||
        (typeof other === 'function' && a instanceof other)
      )
    }
  }

  return false
}

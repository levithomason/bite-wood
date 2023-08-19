import { lerp } from './math.js'

//
// Collision Detection
//

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
 * @typedef {Object} CollisionLineLineResult
 * @property {number} x - The x position of the intersection.
 * @property {number} y - The y position of the intersection.
 * @property {number} line1Time - The time along line 1 where the intersection occurs.
 * @property {number} line2Time - The time along line 2 where the intersection occurs.
 */

/**
 * Checks if two lines are colliding.
 * @see https://youtu.be/fHOLQJo0FjQ
 * @param {number} x1 - Line 1 point 1 x.
 * @param {number} y1 - Line 1 point 1 y.
 * @param {number} x2 - Line 1 point 2 x.
 * @param {number} y2 - Line 1 point 2 y.
 * @param {number} x3 - Line 2 point 1 x.
 * @param {number} y3 - Line 2 point 1 y.
 * @param {number} x4 - Line 2 point 2 x.
 * @param {number} y4 - Line 2 point 2 y.
 * @return {CollisionLineLineResult|null} - The intersection point (x,y) and times along the lines (0-1) or null if there is no intersection.
 */
export const collisionLineLine = (x1, y1, x2, y2, x3, y3, x4, y4) => {
  // Check if the lines are parallel
  const denominator = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1)
  if (denominator === 0) {
    return null
  }

  // t is the point where the intersection point would be on line 1
  // u is the point where the intersection point would be on line 2
  // Values:
  //   <0: the intersection is behind the start of the line
  //   >1: the intersection is past the end of the line
  //   0-1: the intersection is between the start and end of the line
  const t = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denominator
  const u = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denominator

  // Check if the intersection is beyond the end of either line
  if (t < 0 || t > 1 || u < 0 || u > 1) {
    return null
  }

  // Otherwise, the collusion is happening somewhere along the line.
  // We can now calculate the collision point using either t along line 1 or u along line 2.
  // Both points will be the same, the intersection point.
  return {
    line1Time: t,
    line2Time: u,
    x: lerp(x1, x2, t),
    y: lerp(y1, y2, t),
  }
}

/**
 * @typedef {Object} CollisionLineRectangleResult
 * @property {number} x - The x position of the intersection.
 * @property {number} y - The y position of the intersection.
 * @property {number} lineTime - The time along the line (0-1) where the intersection occurs.
 */

/**
 * Checks if a line is colliding with a rectangle.
 * @param x1 - Line 1 point 1 x.
 * @param y1 - Line 1 point 1 y.
 * @param x2 - Line 1 point 2 x.
 * @param y2 - Line 1 point 2 y.
 * @param x3 - Rectangle point 1 x.
 * @param y3 - Rectangle point 1 y.
 * @param x4 - Rectangle point 2 x.
 * @param y4 - Rectangle point 2 y.
 * @return {CollisionLineRectangleResult|null} - The intersection point (x,y), time along the line (0-1), and side of the rectangle or null if there is no intersection.
 */
export const collisionLineRectangle = (x1, y1, x2, y2, x3, y3, x4, y4) => {
  // console.group('collisionLineRectangle')
  const l = { x1, y1, x2, y2 }
  const r = {
    x1: Math.min(x3, x4),
    y1: Math.min(y3, y4),
    x2: Math.max(x3, x4),
    y2: Math.max(y3, y4),
  }

  // Check if the line is inside the rectangle.
  // If so, return the start point of the line.
  // if (l.x1 >= r.x1 && l.x1 <= r.x2 && l.y1 >= r.y1 && l.y1 <= r.y2) {
  //   return { x: l.x1, y: l.y1, lineTime: 0 }
  // }

  let nearest = null
  const a = collisionLineLine(l.x1, l.y1, l.x2, l.y2, r.x1, r.y1, r.x2, r.y1)
  const b = collisionLineLine(l.x1, l.y1, l.x2, l.y2, r.x2, r.y1, r.x2, r.y2)
  const c = collisionLineLine(l.x1, l.y1, l.x2, l.y2, r.x2, r.y2, r.x1, r.y2)
  const d = collisionLineLine(l.x1, l.y1, l.x2, l.y2, r.x1, r.y2, r.x1, r.y1)

  // a && console.log('a', a)
  // b && console.log('b', b)
  // c && console.log('c', c)
  // d && console.log('d', d)

  if (a) nearest = a
  if (b && (!nearest || b.line1Time < nearest.line1Time)) nearest = b
  if (c && (!nearest || c.line1Time < nearest.line1Time)) nearest = c
  if (d && (!nearest || d.line1Time < nearest.line1Time)) nearest = d

  let ret

  // No intersection with any of the sides
  ret = nearest
    ? { x: nearest.x, y: nearest.y, lineTime: nearest.line1Time }
    : null

  if (ret) {
    // console.log('return', ret)
  }

  // console.groupEnd()
  return ret
}

export const collisionRectangleRectangle = (x1, y1, x2, y2, x3, y3, x4, y4) => {
  return x1 <= x4 && x2 >= x3 && y1 <= y4 && y2 >= y3
}

/**
 * Checks if an object instance is colliding with another object instance.
 * Works with stationary and moving objects.
 * Prevents tunneling by checking the previous position of the object.
 * @param {GameObject} self
 * @param {GameObject} other
 * @return {boolean}
 */
export const collisionObjectObject = (self, other) => {
  // const isTunnelingPossible = Math.abs(self.speed) + Math.abs(other.speed)
  return (
    // // overlapping bounding boxes
    // collisionRectangleRectangle(
    //   self.boundingBoxLeft,
    //   self.boundingBoxTop,
    //   self.boundingBoxRight,
    //   self.boundingBoxBottom,
    //   other.boundingBoxLeft,
    //   other.boundingBoxTop,
    //   other.boundingBoxRight,
    //   other.boundingBoxBottom,
    // )
    // ||
    // Check for self tunneling through other
    // collisionLineRectangle(
    //   self.xPrevious,
    //   self.yPrevious,
    //   self.x,
    //   self.y,
    //   other.boundingBoxLeft - self.boundingBoxWidth / 2,
    //   other.boundingBoxTop - self.boundingBoxHeight / 2,
    //   other.boundingBoxRight + self.boundingBoxWidth / 2,
    //   other.boundingBoxBottom + self.boundingBoxHeight / 2,
    // )
    // ||
    // Check for other tunneling through self
    collisionLineRectangle(
      other.xPrevious,
      other.yPrevious,
      other.x,
      other.y,
      self.boundingBoxLeft - other.boundingBoxWidth / 2,
      self.boundingBoxTop - other.boundingBoxHeight / 2,
      self.boundingBoxRight + other.boundingBoxWidth / 2,
      self.boundingBoxBottom + other.boundingBoxHeight / 2,
    )
  )
}

//
// Collision query
// These functions query the active collisions. They do not iterate the objects.
//

/**
 * Checks if the top side of an object is colliding with some other object.
 * @param {GameObject} self
 * @param {GameObject} other
 * @returns {boolean}
 */
export const onTop = (self, other) => {
  const isTopIntersecting =
    self.boundingBoxTop <= other.boundingBoxBottom &&
    self.boundingBoxTop >= other.boundingBoxTop
  const isOneSideIntersecting =
    self.boundingBoxLeft <= other.boundingBoxRight &&
    self.boundingBoxRight >= other.boundingBoxLeft

  // if (isTopIntersecting && isOneSideIntersecting) {
  //   console.log(self.name, 'Top')
  // }

  return isTopIntersecting && isOneSideIntersecting
}
/**
 * Checks if the bottom side of an object is colliding with some other object.
 * @param {GameObject} self
 * @param {GameObject} other
 * @returns {boolean}
 */
export const onBottom = (self, other) => {
  const isBottomIntersecting =
    self.boundingBoxBottom >= other.boundingBoxTop &&
    self.boundingBoxBottom <= other.boundingBoxBottom
  const isOneSideIntersecting =
    self.boundingBoxLeft <= other.boundingBoxRight &&
    self.boundingBoxRight >= other.boundingBoxLeft

  // if (isBottomIntersecting && isOneSideIntersecting) {
  //   console.log(self.name, 'Bottom')
  // }

  return isBottomIntersecting && isOneSideIntersecting
}
/**
 * Checks if the left side of an object is colliding with some other object.
 * @param {GameObject} self
 * @param {GameObject} other
 * @returns {boolean}
 */
export const onLeft = (self, other) => {
  const isLeftIntersecting =
    self.boundingBoxLeft <= other.boundingBoxRight &&
    self.boundingBoxLeft >= other.boundingBoxLeft
  const isOneSideIntersecting =
    self.boundingBoxTop <= other.boundingBoxBottom &&
    self.boundingBoxBottom >= other.boundingBoxTop

  // if (isLeftIntersecting && isOneSideIntersecting) {
  //   console.log(self.name, 'Left')
  // }

  return isLeftIntersecting && isOneSideIntersecting
}
/**
 * Checks if the right side of an object is colliding with some other object.
 * @param {GameObject} self
 * @param {GameObject} other
 * @returns {boolean}
 */
export const onRight = (self, other) => {
  const isRightIntersecting =
    self.boundingBoxRight >= other.boundingBoxLeft &&
    self.boundingBoxRight <= other.boundingBoxRight
  const isOneSideIntersecting =
    self.boundingBoxTop <= other.boundingBoxBottom &&
    self.boundingBoxBottom >= other.boundingBoxTop

  // if (isRightIntersecting && isOneSideIntersecting) {
  //   console.log(self.name, 'Right')
  // }

  return isRightIntersecting && isOneSideIntersecting
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
  // console.log('_activeCollisions START:', _activeCollisions)

  for (let i = 0; i < objects.length; i += 1) {
    const self = objects[i]

    // We only want to iterate over objects that are after the current object.
    // This way we do not check collisions against self.
    // This also ensures we check collisions once per unique pair of objects.
    for (let j = i + 1; j < objects.length; j += 1) {
      const other = objects[j]

      const collision = collisionObjectObject(self, other)
      // console.log(`${self.name} vs ${other.name}`)

      if (collision) {
        self.collision = collision
        other.collision = collision
        // console.log(self.name, 'collided with', other.name)
        _activeCollisions.push([self, other])
      }
      // console.log(_activeCollisions)
    }
  }

  // console.log('_activeCollisions END:', _activeCollisions)

  // resolve collisions
  _activeCollisions.forEach(([objectA, objectB]) => {
    // console.log('resolve collision:', objectA.name, objectB.name)
    // console.debug(
    //   `TODO: resolve "${objectA.collider}" vs "${objectB.collider}" collision`,
    // )

    // moveOutside(objectA, objectB)

    // call user code for collisions
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

//
// Collision Resolution
//

/**
 * Moves `self` outside the `other` object after a collision.
 * @param {GameObject} self
 * @param {GameObject} other
 */
export const moveOutside = (self, other) => {
  // console.log('moveOutside()')

  const sides = [
    {
      active: onTop(self, other),
      overlap: other.boundingBoxBottom - self.boundingBoxTop,
      side: 'top',
    },
    {
      active: onBottom(self, other),
      overlap: self.boundingBoxBottom - other.boundingBoxTop,
      side: 'bottom',
    },
    {
      active: onLeft(self, other),
      overlap: other.boundingBoxRight - self.boundingBoxLeft,
      side: 'left',
    },
    {
      active: onRight(self, other),
      overlap: self.boundingBoxRight - other.boundingBoxLeft,
      side: 'right',
    },
  ].filter(({ active }) => active)

  if (sides.length === 0) {
    return
  }

  const overlapToResolve = sides.reduce((acc, next) => {
    return next.overlap < acc.overlap ? next : acc
  })

  // console.log('...BEFORE', {
  //   top: onTop(self, other),
  //   bottom: onBottom(self, other),
  //   left: onLeft(self, other),
  //   right: onRight(self, other),
  // })

  // console.log('...move', overlapToResolve.side, 'by', overlapToResolve.overlap)

  if (overlapToResolve.side === 'top') {
    self.y += overlapToResolve.overlap + 1
  } else if (overlapToResolve.side === 'bottom') {
    self.y -= overlapToResolve.overlap + 1
  } else if (overlapToResolve.side === 'left') {
    self.x += overlapToResolve.overlap + 1
  } else if (overlapToResolve.side === 'right') {
    self.x -= overlapToResolve.overlap + 1
  }

  // console.log('...AFTER', {
  //   top: onTop(self, other),
  //   bottom: onBottom(self, other),
  //   left: onLeft(self, other),
  //   right: onRight(self, other),
  // })

  //
  // self[overlapToResolve.axis] += overlapToResolve.distance + margin
  //
  // if (overlapToResolve.axis === 'y') self.vspeed = 0
  // if (overlapToResolve.axis === 'x') self.hspeed = 0
}

/**
 * Bounces two objects off of each other according to their mass and velocity.
 * @see https://en.wikipedia.org/wiki/Elastic_collision
 * @param {GameObject} a
 * @param {GameObject} b
 */
export const bounceObjects = (a, b) => {
  const massTotal = a.mass + b.mass

  const aHSpeed = a.hspeed
  const aVSpeed = a.vspeed

  const bHSpeed = b.hspeed
  const bVSpeed = b.vspeed

  a.hspeed = (aHSpeed * (a.mass - b.mass) + 2 * b.mass * bHSpeed) / massTotal
  a.vspeed = (aVSpeed * (a.mass - b.mass) + 2 * b.mass * bVSpeed) / massTotal

  b.hspeed = (bHSpeed * (b.mass - a.mass) + 2 * a.mass * aHSpeed) / massTotal
  b.vspeed = (bVSpeed * (b.mass - a.mass) + 2 * a.mass * aVSpeed) / massTotal
}

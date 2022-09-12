import { GameObject } from "./game/game-object"

/**
 * Checks if the top side of an object is colliding with some other object.
 * @param {GameObject} self
 * @param {GameObject} other
 * @returns {boolean}
 */
export type onTop = (self: GameObject, other: GameObject) => boolean
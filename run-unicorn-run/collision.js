import * as utils from './utils.js'

export const collisionPoint = (x, y, object) => {
  return x >= object.x - object.width && x <= object.x
}

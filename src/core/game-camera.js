import { gameMouse } from './game-mouse-controller.js'
import { gameDrawing } from './game-drawing-controller.js'

export class GameCamera {
  #x = 0
  #y = 0
  constructor() {
    /**
     * @type {{x: number, y: number} | null}
     */
    this.target = null
  }

  move(x, y) {
    // We need to move the mouse by the same amount as the camera.
    // Move the mouse first since we need to compute the camera delta
    // and the delta is lost once the camera is already moved.
    gameMouse.x += x - this.#x
    gameMouse.y += y - this.#y

    gameDrawing.moveCamera(x, y)

    this.#x = x
    this.#y = y
  }

  get x() {
    return this.#x
  }
  set x(val) {
    gameMouse.x += val - this.#x
    gameDrawing.moveCamera(val, this.#y)
    this.#x = val
  }

  get y() {
    return this.#y
  }
  set y(val) {
    gameMouse.y += val - this.#y
    gameDrawing.moveCamera(this.#x, val)
    this.#y = val
  }
}

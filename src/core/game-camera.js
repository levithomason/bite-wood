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
    gameDrawing.setCamera(x, y)
    this.x = x
    this.y = y
  }

  get x() {
    return this.#x
  }
  set x(val) {
    gameMouse.x += val - this.#x
    this.#x = val
  }

  get y() {
    return this.#y
  }
  set y(val) {
    gameMouse.y += val - this.#y
    this.#y = val
  }
}

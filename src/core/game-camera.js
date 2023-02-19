import { gameMouse } from './game-mouse-controller.js'
import { gameDrawing } from './game-drawing-controller.js'
import { gameRooms } from './game-rooms.js'

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
    // Avoids sub-pixel rendering errors.
    // When rendering two filled rectangles beside each other, there can be a
    // 1px (or partial pixel) gap between them due to partial pixel camera position.
    const xRound = Math.round(x)
    const yRound = Math.round(y)

    // We need to move the mouse by the same amount as the camera.
    // Move the mouse first since we need to compute the camera delta
    // and the delta is lost once the camera is already moved.
    gameMouse.x += xRound - this.#x
    gameMouse.y += yRound - this.#y

    gameDrawing.moveCamera(xRound, yRound)

    this.#x = xRound
    this.#y = yRound
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

  get width() {
    return Math.min(window.innerWidth, gameRooms.currentRoom.width)
  }

  get height() {
    return Math.min(window.innerHeight, gameRooms.currentRoom.height)
  }

  get boxRight() {
    return this.#x + this.width
  }

  get boxLeft() {
    return this.#x
  }

  get boxTop() {
    return this.#y
  }

  get boxBottom() {
    return this.#y + this.height
  }
}

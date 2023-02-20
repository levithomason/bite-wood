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
    this.acceleration = 0.1
  }

  moveTo(x, y) {
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

  get y() {
    return this.#y
  }

  get width() {
    return Math.min(window.innerWidth, gameRooms.currentRoom.width)
  }

  get height() {
    return Math.min(window.innerHeight, gameRooms.currentRoom.height)
  }

  get right() {
    return this.#x + this.width
  }

  get left() {
    return this.#x
  }

  get top() {
    return this.#y
  }

  get bottom() {
    return this.#y + this.height
  }

  step() {
    if (!this.target) return

    const xDelta = this.target.x - this.x - window.innerWidth / 2
    const xChange = xDelta * this.acceleration

    const yDelta = this.target.y - this.y - window.innerHeight / 2
    const yChange = yDelta * this.acceleration

    const newX = Math.max(
      0,
      Math.min(
        this.x + xChange,
        gameRooms.currentRoom.width - window.innerWidth,
      ),
    )
    const newY = Math.max(
      0,
      Math.min(
        this.y + yChange,
        gameRooms.currentRoom.height - window.innerHeight,
      ),
    )

    this.moveTo(newX, newY)
  }
}

import { clamp } from './math.js'
import { gameMouse } from './game-mouse-controller.js'
import { gameDrawing } from './game-drawing-controller.js'
import { gameRooms } from './game-rooms.js'

/**
 * Any point in the game world for the camera to target.
 */
type GameCameraTarget = { x: number; y: number }

export class GameCamera {
  #x = 0
  #y = 0
  target: GameCameraTarget | null
  acceleration: number

  constructor() {
    this.target = null
    this.acceleration = 0.1
  }

  /**
   * Moves the camera to the specified position.
   */
  moveTo(x: number, y: number) {
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

  get x(): number {
    return this.#x
  }

  get y(): number {
    return this.#y
  }

  get width(): number {
    if (!gameRooms.currentRoom) return window.innerWidth

    return Math.min(window.innerWidth, gameRooms.currentRoom.width)
  }

  get height(): number {
    if (!gameRooms.currentRoom) return window.innerHeight

    return Math.min(window.innerHeight, gameRooms.currentRoom.height)
  }

  get top(): number {
    return this.#y
  }

  get left(): number {
    return this.#x
  }

  get right(): number {
    return this.#x + this.width
  }

  get bottom(): number {
    return this.#y + this.height
  }

  step() {
    if (!this.target) return

    const xDelta = this.target.x - this.x - this.width / 2
    const xChange = xDelta * this.acceleration

    const yDelta = this.target.y - this.y - this.height / 2
    const yChange = yDelta * this.acceleration

    // Clamp the camera to the room boundaries
    // TODO: always checking for the current room seems wrong.
    //       how could you have a camera with no room?
    //       consider making the room a required part of starting the game.
    const xMax = gameRooms.currentRoom
      ? gameRooms.currentRoom.width - this.width
      : window.innerWidth - this.width

    const yMax = gameRooms.currentRoom
      ? gameRooms.currentRoom.height - this.height
      : window.innerHeight - this.height

    const x = clamp(this.x + xChange, 0, xMax)
    const y = clamp(this.y + yChange, 0, yMax)
    this.moveTo(x, y)
  }
}

import { gameDrawing } from './game-drawing-controller.js'
import { gameCamera } from './game-camera-controller.js'

/** Map of mouse buttons to numbers and back. */
export const MOUSE_BUTTONS = {
  0: 'left',
  1: 'middle',
  2: 'right',
  left: 0,
  middle: 1,
  right: 2,
}

/**
 * Gives the current state of the mouse.
 */
class GameMouse {
  constructor() {
    document.addEventListener('mousemove', this.#handleMouseMove)
    document.addEventListener('mousedown', this.#handleMouseDown)
    document.addEventListener('mouseup', this.#handleMouseUp)
  }

  /** @type {number} x - x position of the mouse on the canvas */
  x = 0

  /** @type {number} y - y position of the mouse on the canvas */
  y = 0

  /**
   * @type {object} active - Object where keys are left|right|middle and values are boolean.
   * @property {boolean} active.left - True when the left mouse button is pressed.
   * @property {boolean} active.right - True when the right mouse button is pressed.
   * @property {boolean} active.middle - True when the middle mouse button is pressed.
   */
  active = {}

  /**
   * @type {object} down - Object where keys are left|right|middle and values are boolean.
   * @property {boolean} down.left - True when the left mouse button is down, fires once.
   * @property {boolean} down.right - True when the right mouse button is down, fires once.
   * @property {boolean} down.middle - True when the middle mouse button is down, fires once.
   */
  down = {}

  /**
   * @type {object} up - Object where keys are left|right|middle and values are boolean.
   * @property {boolean} up.left - True when the left mouse button is up, fires once.
   * @property {boolean} up.right - True when the right mouse button is up, fires once.
   * @property {boolean} up.middle - True when the middle mouse button is up, fires once.
   */
  up = {}

  /** @param {MouseEvent} e */
  #setMousePosition = (e) => {
    // TODO: this doesn't let the mouse work outside of the canvas
    // In order to track the mouse position outside of the canvas, we'd need to add the
    // offset position of the canvas to the pageX/Y.  The canvas can be placed anywhere
    // on the screen with CSS.  We would have to query for the canvas and add the offset.
    // However, we don't want state to have a dependency on the canvas, since there may
    // be multiple canvases (such as in a sprite editor).  It would also be a perf hit.
    //
    // By using the layerX/Y of any canvas, we get the added benefit of a proper mouse
    // position on any canvas.

    // This tracks the mouse position anywhere in the document, including outside the canvas.

    this.x = e.pageX - gameDrawing.canvas.offsetLeft + gameCamera.x
    this.y = e.pageY - gameDrawing.canvas.offsetTop + gameCamera.y
  }

  /** @param {MouseEvent} e */
  #handleMouseMove = (e) => {
    this.#setMousePosition(e)
  }

  /** @param {MouseEvent} e */
  #handleMouseDown = (e) => {
    const button = MOUSE_BUTTONS[e.button]

    // the position hasn't been set if the user hasn't moved the mouse yet
    this.#setMousePosition(e)

    this.down[button] = true
    this.active[button] = true
  }

  /** @param {MouseEvent} e */
  #handleMouseUp = (e) => {
    const button = MOUSE_BUTTONS[e.button]

    // the position hasn't been set if the user hasn't moved the mouse yet
    this.#setMousePosition(e)

    this.up[button] = true
  }

  step() {
    // clear active buttons that are in up state
    for (const button in this.active) {
      if (this.up[button]) {
        delete this.active[button]
      }
    }

    this.down = {}
    this.up = {}
  }

  /**
   * Draws a debug view of the mouse.
   * @param {GameDrawing} drawing
   */
  drawDebug(drawing) {
    const height = 15
    const offsetBottom = 24

    const padX = 60

    let x = this.x - gameCamera.x

    if (this.x < gameCamera.left + padX) {
      x = gameCamera.left + padX - gameCamera.x
    } else if (this.x > gameCamera.right - padX) {
      x = gameCamera.right - padX - gameCamera.x
    }

    let y = this.y + offsetBottom - gameCamera.y

    if (this.y < gameCamera.top) {
      y = offsetBottom - gameCamera.y
    } else if (this.y > gameCamera.bottom - height) {
      y = gameCamera.bottom - offsetBottom - height - gameCamera.y
    } else if (this.y > gameCamera.bottom - offsetBottom - height) {
      y = this.y - offsetBottom - gameCamera.y
    }

    const text = `(${this.x}, ${this.y})`

    drawing.saveSettings()

    drawing.setFontSize(10)
    drawing.setFontFamily('monospace')
    drawing.setTextAlign('center')
    drawing.setTextBaseline('top')

    // text background
    const textWidth = drawing.measureText(text)
    const textPadX = 4
    drawing.setStrokeColor('transparent')
    drawing.setFillColor('rgba(0, 0, 0, 0.25)')
    drawing.rectangle(
      x - textWidth / 2 - textPadX,
      y - 2,
      textWidth + textPadX * 2,
      height,
    )

    // text
    drawing.setLineWidth(1)
    drawing.setFillColor('#fff')
    drawing.text(text, x, y)

    drawing.loadSettings()
  }
}

export const gameMouse = new GameMouse()
window.biteWood = window.biteWood || {}
window.biteWood.gameMouse = gameMouse

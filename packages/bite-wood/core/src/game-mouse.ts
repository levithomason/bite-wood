import { gameDrawing } from './game-drawing-controller.js'
import { gameCamera } from './game-camera-controller.js'

type ButtonNumber = 0 | 1 | 2
type ButtonName = 'left' | 'middle' | 'right'

/** Map of mouse button numbers to strings */
export const MOUSE_BUTTON_TO_STRING: {
  [key in ButtonNumber]: ButtonName
} = {
  0: 'left',
  1: 'middle',
  2: 'right',
}

/**
 * Gives the current state of the mouse.
 */
export class GameMouse {
  constructor() {
    document.addEventListener('mousemove', this.#handleMouseMove)
    document.addEventListener('mousedown', this.#handleMouseDown)
    document.addEventListener('mouseup', this.#handleMouseUp)
  }

  /** The x position of the mouse on the canvas. */
  x: number = 0

  /** The y position of the mouse on the canvas. */
  y: number = 0

  /**
   * @type {object} active - Object where keys are left|right|middle and values are boolean.
   * @property {boolean} active.left - True when the left mouse button is pressed.
   * @property {boolean} active.right - True when the right mouse button is pressed.
   * @property {boolean} active.middle - True when the middle mouse button is pressed.
   */
  active: {
    [key in ButtonName]: boolean
  } = {
    left: false,
    right: false,
    middle: false,
  }

  /**
   * @type {object} down - Object where keys are left|right|middle and values are boolean.
   * @property {boolean} down.left - True when the left mouse button is down, fires once.
   * @property {boolean} down.right - True when the right mouse button is down, fires once.
   * @property {boolean} down.middle - True when the middle mouse button is down, fires once.
   */
  down: {
    [key in ButtonName]: boolean
  } = {
    left: false,
    right: false,
    middle: false,
  }

  /**
   * @type {object} up - Object where keys are left|right|middle and values are boolean.
   * @property {boolean} up.left - True when the left mouse button is up, fires once.
   * @property {boolean} up.right - True when the right mouse button is up, fires once.
   * @property {boolean} up.middle - True when the middle mouse button is up, fires once.
   */
  up: {
    [key in ButtonName]: boolean
  } = {
    left: false,
    right: false,
    middle: false,
  }

  #setMousePosition = (e: MouseEvent) => {
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

  #handleMouseMove = (e: MouseEvent) => {
    this.#setMousePosition(e)
  }

  #handleMouseDown = (e: MouseEvent) => {
    if (e.button !== 0 && e.button !== 1 && e.button !== 2) {
      console.error(
        'GameMouse: Unhandled mouse button on mouse down:',
        e.button,
      )
      return
    }

    const buttonName = MOUSE_BUTTON_TO_STRING[e.button]

    // the position hasn't been set if the user hasn't moved the mouse yet
    this.#setMousePosition(e)

    this.down[buttonName] = true
    this.active[buttonName] = true
  }

  #handleMouseUp = (e: MouseEvent) => {
    if (e.button !== 0 && e.button !== 1 && e.button !== 2) {
      console.error('GameMouse: Unhandled mouse button on mouse up:', e.button)
      return
    }
    const name = MOUSE_BUTTON_TO_STRING[e.button]

    // the position hasn't been set if the user hasn't moved the mouse yet
    this.#setMousePosition(e)

    this.up[name] = true
  }

  step() {
    // clear active buttons that are in up state
    for (const button in this.active) {
      const name = button as ButtonName
      if (this.up[name]) {
        delete this.active[name]
      }
    }

    this.down.left = false
    this.down.right = false
    this.down.middle = false

    this.up.left = false
    this.up.right = false
    this.up.middle = false
  }
}

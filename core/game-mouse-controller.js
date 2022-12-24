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
    if (e.target.tagName !== 'CANVAS') {
      return
    }

    this.x = e.layerX // e.pageX - canvasX
    this.y = e.layerY // e.pageY - canvasY
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

    this.active.left = e.button === MOUSE_BUTTONS.left
    this.active.middle = e.button === MOUSE_BUTTONS.middle
    this.active.right = e.button === MOUSE_BUTTONS.right

    // ensure mousedown only fires once per game step
    // on the first step, the mouse is handled
    // future steps will skip the handled mouses
    // the step that handles MouseUp will remove it from mouse down
    // see the GameObject.invokeInputEvents() method
    // once removed, we know if is safe to mark it true again
    if (!this.down.hasOwnProperty(button)) {
      this.down[button] = true
    }
  }

  /** @param {MouseEvent} e */
  #handleMouseUp = (e) => {
    const button = MOUSE_BUTTONS[e.button]

    // the position hasn't been set if the user hasn't moved the mouse yet
    this.#setMousePosition(e)

    this.up[button] = true

    // since mouse events are handled on game step we can only safely remove
    // mouseactive and mousedown events after a game step handles the mouseup event
    delete this.active[button]
    delete this.down[button]
  }

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
   * @type {object} active - Object where keys are left|right|middle and values are boolean.
   * @property {boolean} active.left - True when the left mouse button is down, fires once.
   * @property {boolean} active.right - True when the right mouse button is down, fires once.
   * @property {boolean} active.middle - True when the middle mouse button is down, fires once.
   */
  down = {}

  /**
   * @type {object} active - Object where keys are left|right|middle and values are boolean.
   * @property {boolean} active.left - True when the left mouse button is up, fires once.
   * @property {boolean} active.right - True when the right mouse button is up, fires once.
   * @property {boolean} active.middle - True when the middle mouse button is up, fires once.
   */
  up = {}
}

export const gameMouse = new GameMouse()
window.biteWood = window.biteWood || {}
window.biteWood.gameMouse = gameMouse

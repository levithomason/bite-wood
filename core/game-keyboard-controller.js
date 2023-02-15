/**
 * Gives the current state of the typing keys.
 */
class GameKeyboard {
  constructor() {
    document.addEventListener('keydown', this.#handleKeyDown)
    document.addEventListener('keyup', this.#handleKeyUp)
  }

  /** @property {object} active - Object where keys are KeyboardEvent.key names and values are boolean */
  active = {}

  /** @property {object} down - Object where keys are KeyboardEvent.key names and values are boolean */
  down = {}

  /** @property {object} up - Object where keys are KeyboardEvent.key names and values are boolean */
  up = {}

  /** @param {KeyboardEvent} e */
  #handleKeyDown = (e) => {
    // CASING_COMMENT:
    // Upper case keys are tracked in down/up/active to ensure expected handling for the developer.
    // If a user presses "w" then "Shift" then releases "W", only the upper case key would be cleared.
    // There would be an active "w" key that is not cleared.
    // To avoid this, the upper case version of the key is tracked instead.
    this.active[e.key.toUpperCase()] = true

    // Key up/down should only fire for one step in the game loop.
    // The game loop will clear key up/down state after each tick.
    // Only set keydown on the first press, not on repeats.
    if (!e.repeat) {
      this.down[e.key.toUpperCase()] = true /* see CASING_COMMENT */
      delete this.up[e.key.toUpperCase()] /* see NOTE_1 */
    }
  }

  /** @param {KeyboardEvent} e */
  #handleKeyUp = (e) => {
    this.up[e.key.toUpperCase()] = true /* see CASING_COMMENT */

    delete this.active[e.key.toUpperCase()] /* see CASING_COMMENT */
    delete this.down[e.key.toUpperCase()] /* see CASING_COMMENT */
  }
}

export const gameKeyboard = new GameKeyboard()

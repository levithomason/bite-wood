const getKey = (e) => e.key.toUpperCase()

/**
 * Gives the current state of the typing keys.
 *
 * CASING:
 * Upper case keys are tracked in down/up/active to ensure expected handling for the developer.
 * If a user presses "w" then "Shift" then releases "W", only the upper case key would be cleared.
 * There would be an active "w" key that is not cleared.
 * To avoid this, the upper case version of the key is tracked instead.
 *
 * ORDER:
 * We want all key presses to be captured and handled by the game loop tick.
 * This means the game loop tick needs to handle clearing the key up/down state.
 * Otherwise, if we clear down state on key up, we could do so before the next tick fires.
 * This causes some key presses to happen without the game reacting to them.
 * Because of this, we only set key values to true here, never false.
 * TODO: This should be handled by a stack of key presses, not a single value.
 *       This would allow for multiple key presses to be handled in a single tick.
 *       This would also allow for key presses to be handled in the order they were pressed/released.
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
    const key = getKey(e)
    this.active[key] = true

    // Key up/down should only fire for one step in the game loop.
    // The game loop will clear key up/down state after each tick.
    // Only set keydown on the first press, not on repeats.
    if (!e.repeat) {
      this.down[key] = true
    }
  }

  /** @param {KeyboardEvent} e */
  #handleKeyUp = (e) => {
    const key = getKey(e)
    this.up[key] = true
  }

  postStep() {
    // clear active keys that are in up state
    for (const key in this.active) {
      if (this.up[key]) {
        delete this.active[key]
      }
    }

    this.down = {}
    this.up = {}
  }
}

export const gameKeyboard = new GameKeyboard()
window.biteWood = window.biteWood || {}
window.biteWood.gameKeyboard = gameKeyboard

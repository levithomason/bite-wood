import { gameState } from './game-state-controller.js'

/**
 * Gives the current state of the keyboard keys.
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
    this.active[e.key] = true

    // Key up/down should only fire for one step in the game loop.
    // The game loop will clear key up/down state after each tick.
    // Only set keydown on the first press, not on repeats.
    if (!e.repeat) {
      this.down[e.key] = true
      delete this.up[e.key]
    }
  }

  /** @param {KeyboardEvent} e */
  #handleKeyUp = (e) => {
    this.up[e.key] = true

    delete this.active[e.key]
    delete this.down[e.key]
  }
}

export const gameKeyboard = new GameKeyboard()

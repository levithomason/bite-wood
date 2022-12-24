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
  #handleKeyDown = e => {
    this.active[e.key] = true

    // ensure keydown only fires once per game step
    // on the first step, the key is handled
    // future steps will skip the handled keys
    // the step that handles KeyUp will remove it from key down
    // see the GameObject step method
    // once removed, we know if is safe to mark it true again
    if (!this.down.hasOwnProperty(e.key)) {
      this.down[e.key] = true
    }

    switch (e.key) {
      case 'p':
        if (gameState.isPlaying) {
          gameState.pause()
        } else {
          gameState.play()
        }
        break
      case '`':
        gameState.debug = !gameState.debug
        break
    }
  }

  /** @param {KeyboardEvent} e */
  #handleKeyUp = e => {
    this.up[e.key] = true

    // since key events are handled on game step we can only safely remove
    // keyboard and keydown events after a game step handles the keyup event
    delete this.active[e.key]
    delete this.down[e.key]
  }
}

export const gameKeyboard = new GameKeyboard()

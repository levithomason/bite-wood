import * as draw from '../draw.js'
import state, { trackMouseState } from '../state.js'

export default class Game {
  /**
   * @property {GameObject[]} objects
   * @property {GameImage} background
   * @property {object} keysDown
   */
  constructor() {
    const canvas = document.createElement('canvas')
    canvas.setAttribute('width', state.width)
    canvas.setAttribute('height', state.height)
    canvas.setAttribute('data-game', 'true')
    document.body.append(canvas)

    draw.init(canvas.getContext('2d'))
    trackMouseState(canvas)

    this.setBackgroundImage = this.setBackgroundImage.bind(this)

    this.start = this.start.bind(this)
    this.pause = this.pause.bind(this)
    this.tick = this.tick.bind(this)

    this.step = this.step.bind(this)
    this.draw = this.draw.bind(this)
  }

  /** @param image {GameImage} */
  setBackgroundImage(image) {
    this.backgroundImage = image
  }

  start() {
    state.isPlaying = true
    this.tick()
  }

  pause() {
    state.isPlaying = false
    cancelAnimationFrame(this.timer)
  }

  tick() {
    this.step()
    this.draw()

    if (state.isPlaying) {
      this.timer = requestAnimationFrame(this.tick)
    }
  }

  step() {
    state.objects.forEach(object => {
      if (object.step) {
        object.step(object, state)
      }
    })
  }

  draw() {
    draw.erase()
    draw.image(this.backgroundImage)

    if (state.debug) {
      draw.grid()
    }

    state.objects.forEach(object => {
      if (object.draw) object.draw()

      if (object.events && object.events.draw && object.events.draw.actions) {
        object.events.draw.actions.forEach(action => {
          action(object, state)
        })
      }
    })

    if (state.debug) {
      draw.text(
        `${state.mouse.x}, ${state.mouse.y}`,
        state.mouse.x + 10,
        state.mouse.y - 10,
      )
    }
  }
}

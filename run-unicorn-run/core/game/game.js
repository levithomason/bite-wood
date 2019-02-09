import * as draw from '../draw.js'
import state from '../state.js'

export default class Game {
  /**
   * @property {GameObject[]} objects
   * @property {GameImage} background
   * @property {object} keysDown
   */
  constructor() {
    const canvas = document.createElement('canvas')
    canvas.setAttribute('width', state.room.width)
    canvas.setAttribute('height', state.room.height)
    canvas.setAttribute('data-game', 'true')
    document.body.append(canvas)

    draw.init(canvas.getContext('2d'))

    this.setBackgroundImage = this.setBackgroundImage.bind(this)

    this.play = this.play.bind(this)
    this.pause = this.pause.bind(this)
    this.tick = this.tick.bind(this)

    this.step = this.step.bind(this)
    this.draw = this.draw.bind(this)
    this.handleKeyDown = this.handleKeyDown.bind(this)

    document.addEventListener('keydown', this.handleKeyDown)
  }

  handleKeyDown(e) {
    if (e.key === 'p') {
      if (state.isPlaying) {
        this.pause()
      } else {
        this.play()
      }
    }
  }

  /** @param image {GameImage} */
  setBackgroundImage(image) {
    this.backgroundImage = image
  }

  start() {
    this.tick()
  }

  play() {
    state.isPlaying = true
  }

  pause() {
    state.isPlaying = false
  }

  tick() {
    if (state.isPlaying) {
      this.step()
    }

    this.draw()

    requestAnimationFrame(this.tick)
  }

  step() {
    state.room.objects.forEach(object => {
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

    state.room.objects.forEach(object => {
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

    if (!state.isPlaying) {
      draw.setColor('rgba(0, 0, 0, 0.5)')
      draw.rectangle(0, 0, state.room.width, state.room.height)
      draw.setColor('#fff')
      draw.text(`PAUSED`, state.room.width / 2, state.room.height / 2)
    }
  }
}

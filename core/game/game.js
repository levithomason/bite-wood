/**
 * Runs the game loop
 *  - Steps all objects
 *  - Draws all objects
 */
class Game {
  constructor(state, drawing) {
    this.state = state
    this.drawing = drawing

    this._step = this._step.bind(this)
    this._draw = this._draw.bind(this)
    this._tick = this._tick.bind(this)

    this.start = this.start.bind(this)
    this.stop = this.stop.bind(this)
  }

  _step() {
    if (!this.state.isPlaying) return
    if (!this.state.room) return

    this.state.room.objects.forEach(object => {
      if (object.step) {
        object.step(object, this.state)
      }
    })
  }

  _draw() {
    this.drawing.clear()

    if (this.state.room) {
      if (this.state.room.draw) {
        this.state.room.draw(this.drawing)
      }

      this.state.room.objects.forEach(object => {
        if (object.draw) object.draw(this.drawing)
      })
    }

    if (this.state.debug) {
      this.drawing.grid()
      this.drawing.text(
        `${this.state.mouse.x}, ${this.state.mouse.y}`,
        this.state.mouse.x + 10,
        this.state.mouse.y - 10,
      )
    }

    if (!this.state.isPlaying) {
      this.drawing.fill('rgba(0, 0, 0, 0.65)')
      this.drawing.setColor('#fff')
      this.drawing.text(
        `PAUSED`,
        this.state.room.width / 2 - 40,
        this.state.room.height / 2,
      )
    }
  }

  _tick() {
    this.raf = requestAnimationFrame(this._tick)
    this._step()
    this._draw()
  }

  start() {
    this._tick()
  }

  stop() {
    cancelAnimationFrame(this.raf)
  }
}

export default Game

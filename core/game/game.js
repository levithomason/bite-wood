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
      try {
        object?.step?.(object, this.state)
      } catch (err) {
        console.error('Failed to step object:', err)
      }
    })
  }

  _draw() {
    this.drawing.clear()

    if (this.state.room) {
      try {
        this.state.room.draw?.(this.drawing)
      } catch (err) {
        console.error('Failed to draw room:', err)
      }

      this.state.room.objects.forEach(object => {
        try {
          object.draw?.(this.drawing)
        } catch (err) {
          console.error('Failed to draw object:', err)
        }
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

/**
 * Runs the game loop
 *  - Steps all objects
 *  - Draws all objects
 */
class Game {
  constructor(state, drawing) {
    this.state = state
    this.drawing = drawing
    this.isStarted = false
    this.lastTickTimestamp = 0

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
    const timestamp = Date.now()
    const timeSinceTick = timestamp - this.lastTickTimestamp

    // TODO: This is a hacky way of ensuring 120hz displays tick at 60 FPS
    //       A better way is to calc the number of frames that should be ticked.
    //       since the last time they were drawn.
    //       Example:
    //         frames = Math.round((timeNow - lastTickTime) / 16.667)
    //         for frames, tick()
    //         draw()
    if (timeSinceTick >= 15) {
      this.lastTickTimestamp = timestamp
      this._step()
      this._draw()
    }

    this.raf = requestAnimationFrame(this._tick)
  }

  start() {
    if (this.isStarted) return

    this.isStarted = true
    this._tick()
  }

  stop() {
    cancelAnimationFrame(this.raf)
  }
}

export default Game

import { gameDrawing } from './game-drawing-controller.js'
import { gameRooms } from './game-rooms.js'
import { gameMouse } from './game-mouse-controller.js'
import { gameState } from './game-state-controller.js'

// Tracks whether the game loop is running
let _isRunning = false

// Tracks the time of the last tick in the game loop
let _lastTickTimestamp = 0

// Tracks the requestAnimationFrame timer
let _raf = null

/**
 * Runs the game loop. Calls the step() and draw() methods on all objects.
 */
export class Game {
  /**
   * @param {HTMLElement} [parentElement=document.body] - A DOM element where the canvas should be placed.
   * @param {number} [width=800] - The width of the game in pixels.
   * @param {number} [height=600] - The height of the game in pixels.
   */
  constructor(
    { parentElement = document.body, width = 800, height = 600 } = {
      parentElement: document.body,
      width: 800,
      height: 600,
    },
  ) {
    this.start = this.start.bind(this)
    this.stop = this.stop.bind(this)
    this.tick = this.tick.bind(this)

    this.step = this.step.bind(this)
    this.draw = this.draw.bind(this)

    gameDrawing.canvas.width = width
    gameDrawing.canvas.height = height
    parentElement.append(gameDrawing.canvas)
  }

  start() {
    if (_isRunning) return

    _isRunning = true
    this.tick()
  }

  stop() {
    cancelAnimationFrame(_raf)
  }

  tick() {
    const timestamp = Date.now()
    const timeSinceTick = timestamp - _lastTickTimestamp

    // TODO: This is a hacky way of ensuring 120hz displays tick at 60 FPS
    //       A better way is to calc the number of frames that should be ticked.
    //       since the last time they were drawn.
    //       Example:
    //         frames = Math.round((timeNow - lastTickTime) / 16.667)
    //         for frames, tick()
    //         draw()
    if (timeSinceTick >= 15) {
      _lastTickTimestamp = timestamp
      this.step()
      this.draw()
    }

    _raf = requestAnimationFrame(this.tick)
  }

  step() {
    if (!gameState.isPlaying) return
    if (!gameRooms.currentRoom) return

    gameRooms.currentRoom.objects.forEach(object => {
      try {
        object.step?.(object)
      } catch (err) {
        console.error('Failed to step object:', err)
      }
    })
  }

  draw() {
    gameDrawing.clear()

    // room - continue drawing if the room fails
    if (gameRooms.currentRoom) {
      try {
        gameRooms.currentRoom.draw?.(gameDrawing)
      } catch (err) {
        console.error('Failed to draw room:', err)
      }

      // objects - continue drawing if the room fails
      gameRooms.currentRoom.objects.forEach(object => {
        try {
          object.draw?.(gameDrawing)
        } catch (err) {
          console.error('Failed to draw object:', err)
        }

        if (gameState.debug) {
          gameDrawing.objectDebug(object)
        }
      })
    }

    // debug
    if (gameState.debug) {
      gameDrawing.text(
        `${gameMouse.x}, ${gameMouse.y}`,
        gameMouse.x + 10,
        gameMouse.y - 10,
      )
    }

    // paused
    if (!gameState.isPlaying) {
      gameDrawing.fill('rgba(16, 16, 16, 0.5)')
      gameDrawing.setColor('#fff')
      gameDrawing.setFontSize(18)
      gameDrawing.text(
        `PAUSED`,
        gameRooms.currentRoom.width / 2 - 40,
        gameRooms.currentRoom.height / 2,
      )
    }
  }
}

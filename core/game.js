import { gameCamera } from './game-camera-controller.js'
import { gameDrawing } from './game-drawing-controller.js'
import { gameRooms } from './game-rooms.js'
import { gameMouse } from './game-mouse-controller.js'
import { gameState } from './game-state-controller.js'
import { gameKeyboard } from './game-keyboard-controller.js'
import { avg } from './math.js'
import { handleCollisions } from './collision.js'

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
   * A list of the last 100 FPS values.
   * @private
   * @type {number[]}
   */
  #fps = []

  /**
   * @param {number} stepsPerSecond - The number of times the game loop should run per second.
   */
  constructor(
    { stepsPerSecond = 60 } = {
      stepsPerSecond: 60,
    },
  ) {
    this.start = this.start.bind(this)
    this.stop = this.stop.bind(this)
    this.tick = this.tick.bind(this)

    this.stepObjects = this.stepObjects.bind(this)
    this.draw = this.draw.bind(this)

    this.stepsPerSecond = stepsPerSecond

    document.body.append(gameDrawing.canvas)

    window.biteWood = window.biteWood || {}
    window.biteWood.game = this
  }

  start() {
    if (_isRunning) return

    _isRunning = true
    this.tick()
  }

  stop() {
    cancelAnimationFrame(_raf)
  }

  tick(timestamp) {
    // First tick has no timestamp, but we still want to draw the initial state
    if (timestamp === undefined) {
      this.draw()
      _raf = requestAnimationFrame(this.tick)
      return
    }

    // First tick should have timeSinceTick of 0.
    // _lastTickTimestamp is null on the first tick.
    // Set it to the current timestamp so that we have a starting point.
    // Technically, the time since last tick is the same as the first tick.
    if (!_lastTickTimestamp) _lastTickTimestamp = timestamp

    const timeSinceTick = !_lastTickTimestamp
      ? 0
      : timestamp - _lastTickTimestamp

    let steps = Math.round(timeSinceTick / (1000 / this.stepsPerSecond))
    // No work to do, wait for the next tick
    if (steps === 0) {
      _raf = requestAnimationFrame(this.tick)
      return
    }

    _lastTickTimestamp = timestamp

    // track FPS over 2 seconds
    if (gameState.debug) {
      const fps = 1000 / timeSinceTick
      this.#fps.unshift(fps)
      this.#fps.splice(this.stepsPerSecond * 2)
    }

    // Handle play/pause/debug global keybindings.
    // We check active.Shift vs down.SHIFT to ensure the key combo is caught.
    // Keydown only fires once per step and the user may press them at different times.
    if (gameKeyboard.active.SHIFT && gameKeyboard.down.P) {
      if (gameState.isPlaying) {
        gameState.pause()
      } else {
        gameState.play()
      }
    }

    if (gameKeyboard.down['`']) {
      gameState.debug = !gameState.debug
    }

    // Objects may need to step multiple times if the game is running slowly
    while (steps) {
      this.stepObjects()
      steps--
    }

    this.draw()

    // Key up/down and mouse up/down should only fire once per tick, clear their values
    gameKeyboard.step()
    gameMouse.step()

    _raf = requestAnimationFrame(this.tick)
  }

  stepObjects() {
    if (!gameState.isPlaying) return
    if (!gameRooms.currentRoom) return

    //
    // Collisions
    //
    handleCollisions(gameRooms.currentRoom.objects)

    //
    // Step - user code should "win", call step after collisions
    //
    gameRooms.currentRoom.objects.forEach((object) => {
      try {
        object.step?.(object)
      } catch (err) {
        console.error('Failed to step object:', err)
      }
    })
  }

  draw() {
    // Order of drawing is important:
    // 1. Clear the canvas
    // 2. Save the current canvas settings (prior to camera translation)
    // 3. Step the camera (translate the canvas)
    // 4. Draw the room, objects, and anything else (translated by the camera)
    // 6. Restore the canvas settings (including the camera translation)
    // 7. Draw debug information in fixed positions (not translated by the camera)

    gameDrawing.clear()
    gameDrawing.saveSettings()

    // Stepping the camera translates the canvas.
    // All drawings from here forward are relative to the camera until we loadSettings.
    gameCamera.step()

    // room - continue drawing if the room fails
    if (gameRooms.currentRoom) {
      try {
        gameRooms.currentRoom.draw?.(gameDrawing)
      } catch (err) {
        console.error('Failed to draw room:', err)
      }

      if (gameState.debug) {
        // TODO: this should use the room's grid size which doesn't exist yet
        gameDrawing.grid(
          32,
          gameCamera.x,
          gameCamera.y,
          gameRooms.currentRoom.width,
          gameRooms.currentRoom.height,
        )
      }

      // objects
      gameRooms.currentRoom.objects.forEach((object) => {
        // continue drawing if the room fails
        try {
          object.draw?.(gameDrawing)
        } catch (err) {
          console.error('Failed to draw object:', err)
        }

        // Object debug needs to draw before gameDrawing.loadSettings()
        // so that the object's debug info is translated by the camera.
        // We're also already iterating over the objects here.
        if (gameState.debug) {
          gameDrawing.objectDebug(object)
        }
      })

      if (gameState.debug) {
        gameDrawing.cameraDebug()
      }
    }

    // Loading settings also restores the camera translation.
    // All drawings from here on are "fixed" position the screen.
    gameDrawing.loadSettings()

    // debug drawings
    if (gameState.debug) {
      gameDrawing.fpsDebug(avg(this.#fps))
      gameDrawing.mouseDebug()
    }

    // paused - overlay
    if (!gameState.isPlaying) {
      const text = `PAUSED`
      // TODO: This is drawn after the gameDrawing translation is restored (loadSettings).
      //       This means 0 represents the top left of the screen, not the top left of the room.
      //       In other words, it is the "fixed" position.
      //       We should have a way to reference "fixed" positions and "room" positions.
      const x = gameCamera.width / 2
      const y = gameCamera.height / 2

      gameDrawing.saveSettings()

      // backdrop
      gameDrawing.fill('rgba(16, 16, 16, 0.5)')

      // text
      gameDrawing
        .setFontFamily() // default
        .setFontSize(18)
        .setTextAlign('center')
        .setFillColor('#fff')
        .setStrokeColor('#000')
        .text(text, x, y)
        .loadSettings()
    }
  }
}

import * as utils from './math.js'

/**
 * @property {GameObject[]} room.objects
 * @property {GameImage} room.background
 * @property {object} keys
 * @property {object} keysDown
 * @property {object} keysUp
 * @property {object} mouse
 * @property {number} mouse.x
 * @property {number} mouse.y
 */
const state = {
  debug: false,
  isPlaying: true,

  rooms: [],
  roomIndex: -1,
  get room() {
    return state.rooms[state.roomIndex]
  },

  /** @param {GameRoom} room */
  addRoom(room) {
    state.rooms.push(room)

    if (state.rooms.length === 1) {
      state.setRoomIndex(0)
    }
  },

  /**
   * Returns true if the room changed.
   * @param {number} index
   * @returns {boolean}
   */
  setRoomIndex(index) {
    const nextIndex = utils.clamp(index, 0, state.rooms.length - 1)
    const didChange = nextIndex !== state.roomIndex

    if (didChange) {
      const persistedObjects = []

      if (state.room) {
        state.room.objects = state.room.objects.filter(object => {
          if (object.persist) persistedObjects.push(object)

          return !object.persist
        })

        if (state.room.backgroundMusic) {
          state.room.backgroundMusic.pause()
        }
      }

      state.roomIndex = nextIndex

      if (state.room) {
        if (!state.room.initialized) {
          state.room.init()
        }
        state.room.objects = state.room.objects.concat(persistedObjects)
        if (state.room.backgroundMusic) state.room.backgroundMusic.play()
      }
    }

    return didChange && !!state.room
  },

  /**
   * Returns true if the room changed.
   * @returns {boolean}
   */
  nextRoom() {
    return state.setRoomIndex(state.roomIndex + 1)
  },

  /**
   * Returns true if the room changed.
   * @returns {boolean}
   */
  prevRoom() {
    return state.setRoomIndex(state.roomIndex - 1)
  },

  /** @returns {boolean} */
  isFirstRoom() {
    return state.roomIndex === 0
  },

  /** @returns {boolean} */
  isLastRoom() {
    return state.roomIndex === state.rooms.length - 1
  },

  //
  // Physics
  //
  physics: {
    DIRECTION_UP: 270,
    DIRECTION_DOWN: 90,
    DIRECTION_LEFT: 180,
    DIRECTION_RIGHT: 0,

    gravity: new utils.Vector(90, 0.4),
    terminalVelocity: 15,

    friction: 0.3,
  },

  //
  // Input
  //

  keys: {
    active: {},
    down: {},
    up: {},
  },

  mouse: {
    x: 0,
    y: 0,
    active: {},
    down: {},
    up: {},
  },
}

//
// Play/Pause
//

export const play = () => {
  state.isPlaying = true

  if (state.room.backgroundMusic) {
    state.room.backgroundMusic.play()
  }
}

export const pause = () => {
  state.isPlaying = false

  if (state.room.backgroundMusic) {
    state.room.backgroundMusic.pause()
  }
}

//
// Keyboard
//

/** @param {KeyboardEvent} e */
const handleKeyDown = e => {
  state.keys.active[e.key] = true

  // ensure keydown only fires once per game step
  // on the first step, the key is handled
  // future steps will skip the handled keys
  // the step that handles KeyUp will remove it from key down
  // see the GameObject.invokeKeyboardEvents() method
  // once removed, we know if is safe to mark it true again
  if (!state.keys.down.hasOwnProperty(e.key)) {
    state.keys.down[e.key] = true
  }

  switch (e.key) {
    case 'p':
      if (state.isPlaying) {
        pause()
      } else {
        play()
      }
      break
    case 'd':
      state.debug = !state.debug
      break
  }
}

/** @param {KeyboardEvent} e */
const handleKeyUp = e => {
  state.keys.up[e.key] = true

  // since key events are handled on game step we can only safely remove
  // keyboard and keydown events after a game step handles the keyup event
  delete state.keys.active[e.key]
  delete state.keys.down[e.key]
}

document.addEventListener('keydown', handleKeyDown)
document.addEventListener('keyup', handleKeyUp)

//
// Mouse
//

const MOUSE_BUTTON = {
  0: 'left',
  1: 'middle',
  2: 'right',
  left: 0,
  middle: 1,
  right: 2,
}

/** @param {MouseEvent} e */
const setMousePosition = e => {
  // TODO: this doesn't let the mouse work outside of the canvas
  // In order to track the mouse position outside of the canvas, we'd need to add the
  // offset position of the canvas to the pageX/Y.  The canvas can be placed anywhere
  // on the screen with CSS.  We would have to query for the canvas and add the offset.
  // However, we don't want state to have a dependency on the canvas, since there may
  // be multiple canvases (such as in a sprite editor).  It would also be a perf hit.
  //
  // By using the layerX/Y of any canvas, we get the added benefit of a proper mouse
  // position on any canvas.
  if (e.target.tagName !== 'CANVAS') {
    return
  }

  state.mouse.x = e.layerX // e.pageX - canvasX
  state.mouse.y = e.layerY // e.pageY - canvasY
}

/** @param {MouseEvent} e */
const handleMouseMove = e => {
  setMousePosition(e)
}

/** @param {MouseEvent} e */
const handleMouseDown = e => {
  e.preventDefault()
  const button = MOUSE_BUTTON[e.button]

  // the position hasn't been set if the user hasn't moved the mouse yet
  setMousePosition(e)

  state.mouse.active.left = e.button === MOUSE_BUTTON.left
  state.mouse.active.middle = e.button === MOUSE_BUTTON.middle
  state.mouse.active.right = e.button === MOUSE_BUTTON.right

  // ensure mousedown only fires once per game step
  // on the first step, the mouse is handled
  // future steps will skip the handled mouses
  // the step that handles MouseUp will remove it from mouse down
  // see the GameObject.invokeInputEvents() method
  // once removed, we know if is safe to mark it true again
  if (!state.mouse.down.hasOwnProperty(button)) {
    state.mouse.down[button] = true
  }
}

/** @param {MouseEvent} e */
const handleMouseUp = e => {
  e.preventDefault()
  const button = MOUSE_BUTTON[e.button]

  // the position hasn't been set if the user hasn't moved the mouse yet
  setMousePosition(e)

  state.mouse.up[button] = true

  // since mouse events are handled on game step we can only safely remove
  // mouseactive and mousedown events after a game step handles the mouseup event
  delete state.mouse.active[button]
  delete state.mouse.down[button]
}
document.addEventListener('mousemove', handleMouseMove)
document.addEventListener('mousedown', handleMouseDown)
document.addEventListener('mouseup', handleMouseUp)

window.state = state

export default state

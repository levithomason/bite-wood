import * as utils from './utils.js'
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

  room: {
    width: 800,
    height: 600,
    objects: [],
  },

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
// Room
//

/** @param {GameObject} room */
export const setRoom = room => {
  state.room = room
}

/** @param {GameObject} object */
export const addObject = object => {
  state.room.objects.push(object)
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
const handleMouseMove = e => {
  let canvasX = 0
  let canvasY = 0

  const canvas = document.querySelector('[data-game="true"]')
  if (canvas) {
    const { x, y } = canvas.getBoundingClientRect()
    canvasX = x
    canvasY = y
  }

  state.mouse.x = utils.clamp(e.pageX - canvasX, 0, state.room.width)
  state.mouse.y = utils.clamp(e.pageY - canvasY, 0, state.room.height)
}

/** @param {MouseEvent} e */
const handleMouseDown = e => {
  e.preventDefault()
  const button = MOUSE_BUTTON[e.button]

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

  state.mouse.up[button] = true

  // since mouse events are handled on game step we can only safely remove
  // mouseactive and mousedown events after a game step handles the mouseup event
  delete state.mouse.active[button]
  delete state.mouse.down[button]
}
document.addEventListener('mousemove', handleMouseMove)
document.addEventListener('mousedown', handleMouseDown)
document.addEventListener('mouseup', handleMouseUp)

export default state

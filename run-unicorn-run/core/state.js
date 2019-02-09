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

  keys: {},
  keysDown: {},
  keysUp: {},
  mouse: { x: 0, y: 0 },
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
  state.keys[e.key] = true

  // ensure keydown only fires once per game step
  // only track it after it has been removed by the step method
  if (!state.keysDown.hasOwnProperty(e.key)) {
    state.keysDown[e.key] = true
  }
}

/** @param {KeyboardEvent} e */
const handleKeyUp = e => {
  state.keysUp[e.key] = true
}

document.addEventListener('keydown', handleKeyDown)
document.addEventListener('keyup', handleKeyUp)

//
// Mouse
//

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

  state.mouse.x = Math.min(e.pageX - canvasX, canvas.width)
  state.mouse.y = e.pageY - canvasY < canvasY ? canvasY : e.pageY - canvasY
}
/** @param {MouseEvent} e */
const handleMouseDown = e => {
  state.mouse.down = true
}

/** @param {MouseEvent} e */
const handleMouseUp = e => {
  state.mouse.down = false
}
document.addEventListener('mousemove', handleMouseMove)
document.addEventListener('mousedown', handleMouseDown)
document.addEventListener('mouseup', handleMouseUp)

export default state

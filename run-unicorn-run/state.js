/**
 * @property {GameObject[]} objects
 * @property {GameImage} background
 * @property {object} keysDown
 */
const state = {
  debug: true,
  width: 800,
  height: 600,

  keys: {},
  keysDown: {},
  keysUp: {},
  mouse: { x: 0, y: 0 },

  objects: [],
  isPlaying: false,
}

//
// Objects
//

/** @param object {GameObject} */
export const addObject = object => {
  state.objects.push(object)
}

//
// Keyboard
//

/** @param e {KeyboardEvent} */
const handleKeyDown = e => {
  state.keys[e.key] = true

  // ensure keydown only fires once per game step
  // only track it after it has been removed by the step method
  if (!state.keysDown.hasOwnProperty(e.key)) {
    state.keysDown[e.key] = true
  }
}

/** @param e {KeyboardEvent} */
const handleKeyUp = e => {
  state.keysUp[e.key] = true
}

document.addEventListener('keydown', handleKeyDown)
document.addEventListener('keyup', handleKeyUp)

//
// Mouse
//

/** @param e {MouseEvent} */
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
document.addEventListener('mousemove', handleMouseMove)

/** @param element {HTMLElement} */
export const trackMouseState = element => {}

export default state

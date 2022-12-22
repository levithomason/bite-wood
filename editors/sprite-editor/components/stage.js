import { html } from '../../../node_modules/lit-html/lit-html.js'
import { styleMap } from '../../../node_modules/lit-html/directives/style-map.js'
import DRAWING_TOOLS from '../config/drawing-tools.js'
import { actions, getState, setState } from '../state-manager.js'
import spritePreview from './sprite-preview.js'

// ----------------------------------------
// Events
// ----------------------------------------
//
// We want click/drag/release to work outside of the canvas
// for a better drawing experience. Add the listeners to the
// document and handle events for the canvas accordingly.

let stateBeforeDraw

document.addEventListener('mousedown', e => {
  const state = getState()
  stateBeforeDraw = state

  if (e.target.classList.contains('drawing-canvas')) {
    setState({ isDrawing: true })

    const tool = DRAWING_TOOLS[state.tool]
    const x = Math.floor(e.layerX / state.scale)
    const y = Math.floor(e.layerY / state.scale)

    if (tool.onStart) tool.onStart(x, y, state)
  }
})

document.addEventListener('mousemove', e => {
  const state = getState()

  if (state.isDrawing && e.target.classList.contains('drawing-canvas')) {
    const tool = DRAWING_TOOLS[state.tool]
    const x = Math.floor(e.layerX / state.scale)
    const y = Math.floor(e.layerY / state.scale)

    if (tool.onMove) tool.onMove(x, y, state)
  }
})

document.addEventListener('mouseup', e => {
  const state = getState()

  if (state.isDrawing) {
    setState({ isDrawing: false })

    const tool = DRAWING_TOOLS[state.tool]
    const x = Math.floor(e.layerX / state.scale)
    const y = Math.floor(e.layerY / state.scale)

    if (tool.onEnd) tool.onEnd(x, y, state)

    // new state changed from previous state
    actions.addUndoIfNeeded(stateBeforeDraw, state)
  }
})

// ----------------------------------------
// UI
// ----------------------------------------

function drawingCanvas(state) {
  return html`
    <canvas
      class="drawing-canvas"
      width="${state.width}"
      height="${state.height}"
      style="${styleMap({
        width: state.width * state.scale + 'px',
        height: state.height * state.scale + 'px',
      })}"
    ></canvas>
  `
}

function gridCanvas(state) {
  if (!state.showGrid) return null

  const width = state.width * state.scale
  const height = state.height * state.scale
  const cellSize = state.scale

  const canvas = document.createElement('canvas')
  canvas.classList.add('grid-canvas')
  canvas.width = width
  canvas.height = height

  const ctx = canvas.getContext('2d')
  ctx.fillStyle = 'rgba(127, 127, 127)'

  // horizontals
  for (let i = 0; i < height - 1; i += cellSize) {
    ctx.fillRect(0, i + cellSize, width, 1)
  }

  // verticals
  for (let i = 0; i < width - 1; i += cellSize) {
    ctx.fillRect(i + cellSize, 0, 1, height)
  }

  return html`
    ${canvas}
  `
}

function stage(state) {
  return html`
    <div class="stage">
      ${spritePreview(state)} ${drawingCanvas(state)} ${gridCanvas(state)}
    </div>
  `
}

export default stage

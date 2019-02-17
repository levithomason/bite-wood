import { classMap } from 'https://unpkg.com/lit-html/directives/class-map.js?module'
import { styleMap } from 'https://unpkg.com/lit-html/directives/style-map.js?module'
import {
  html,
  render,
} from 'https://unpkg.com/lit-html@1.0.0/lit-html.js?module'

import storage from './storage.js'
import tinycolor from './tinycolor.js'
import * as imageDataUtils from './imageDataUtils.js'

// ----------------------------------------
// Save / Load
// ----------------------------------------

const stateToJSON = state => {
  return { ...state, data: new Array(state.data) }
}

const stateFromJSON = json => {
  return { ...json, data: imageDataUtils.newArray(json.data) }
}

function save(state) {
  storage.set(state.uid, stateToJSON(state))
}

/** @param {string} uid */
function load(uid) {
  const state = storage.get(state.uid)

  if (state) {
    setState(stateFromJSON(state))
  }
}

// ----------------------------------------
// Name
// ----------------------------------------

function spriteName(state) {
  const handleInput = e => {
    setState({ name: e.target.value })
  }
  const handleKeyDown = e => {
    if (e.key === 'Enter') e.target.blur()
  }

  return html`
    <div class="sprite-name">
      <i class="fas fa-image"></i>
      <input
        @keyDown=${handleKeyDown}
        @input=${handleInput}
        value=${state.name}
      />
    </div>
  `
}

// ----------------------------------------
// Drawing Tools
// ----------------------------------------

function drawingTool(state, { key, icon, label }) {
  function handleClick() {
    setState({ tool: key })
  }

  return html`
    <button
      ?disabled=${!DRAWING_TOOLS[key]}
      class="tool ${classMap({ active: state.tool === key })}"
      @click="${handleClick}"
    >
      ${icon &&
        html`
          <i class="fas fa-fw fa-sm fa-${icon}"></i>
        `}
      ${label &&
        html`
          <span class="label">${label}</span>
        `}
    </button>
  `
}

function drawingTools(state) {
  return html`
    <div class="drawing-tools">
      ${drawingTool(state, DRAWING_TOOLS.pencil)}
      ${drawingTool(state, DRAWING_TOOLS.eraser)}

      <div class="divider"></div>

      ${drawingTool(state, {
        key: 'eye-dropper',
        icon: 'eye-dropper',
        label: 'Pick',
      })}
      ${drawingTool(state, { key: 'brush', icon: 'brush', label: 'Brush' })}
      ${drawingTool(state, { key: 'fill', icon: 'fill-drip', label: 'Fill' })}
      ${drawingTool(state, { key: 'spray', icon: 'spray-can', label: 'Spray' })}

      <div class="divider"></div>

      ${drawingTool(state, { key: 'circle', icon: 'circle', label: 'Circle' })}
      ${drawingTool(state, { key: 'square', icon: 'square', label: 'Square' })}
      ${drawingTool(state, DRAWING_TOOLS.line)}

      <div class="divider"></div>

      ${drawingTool(state, {
        key: 'spline',
        icon: 'bezier-curve',
        label: 'Spline',
      })}
      ${drawingTool(state, {
        key: 'polygon',
        icon: 'draw-polygon',
        label: 'Polygon',
      })}
    </div>
  `
}

// ----------------------------------------
// Action Tools
// ----------------------------------------

function actionTool(state, { key, icon, label, onClick, activeWhen }) {
  return html`
    <button
      ?disabled=${!ACTION_TOOLS[key]}
      class="tool ${classMap({ active: activeWhen && activeWhen(state) })}"
      @click="${e => onClick(e, state)}"
    >
      ${icon &&
        html`
          <i class="fas fa-fw fa-sm fa-${icon}"></i>
        `}
      ${label &&
        html`
          <span class="label">${label}</span>
        `}
    </button>
  `
}

function actionTools(state) {
  return html`
    <div class="action-tools">
      ${actionTool(state, { key: 'undo', icon: 'undo' })}
      ${actionTool(state, { key: 'redo', icon: 'redo' })}

      <div class="divider"></div>

      ${actionTool(state, { key: 'zoom-in', icon: 'search-plus' })}
      ${actionTool(state, { key: 'zoom-out', icon: 'search-minus' })}

      <div class="divider"></div>

      ${actionTool(state, ACTION_TOOLS.clear)}
      ${actionTool(state, ACTION_TOOLS.grid)}
    </div>
  `
}

// ----------------------------------------
// Colors
// ----------------------------------------

function colorSwatch(state, { r = 0, g = 0, b = 0, a = 1 } = {}) {
  const a255 = a * 255

  const handleClick = {
    handleEvent(e) {
      setState({ color: [r, g, b, a255] })
    },

    capture: true,
  }

  return html`
    <button
      class="color-swatch ${classMap({
        active:
          state.color[0] === r &&
          state.color[1] === g &&
          state.color[2] === b &&
          state.color[3] === a255,
      })}"
      style="background: rgba(${r}, ${g}, ${b}, ${a}) ;"
      @click=${handleClick}
    ></button>
  `
}

function colorSwatches(state) {
  const deg = 360

  const hues = 12
  const step = deg / hues

  const tints = 4
  const shades = 4
  const variants = tints + shades + 1

  const swatches = []

  // grayscale
  const gray = tinycolor('#fff')
  for (let i = 0; i < variants; i += 1) {
    gray.darken(100 / variants)
    swatches.push(colorSwatch(state, gray.toRgb()))
  }

  for (let i = 0; i < hues; i += 1) {
    const row = []
    const hsl = { h: i * step, s: 100, l: 50 }

    const light = tinycolor(hsl)
    for (let j = 0; j < tints; j += 1) {
      light.lighten(100 / (tints * 2 + 2))
      row.unshift(colorSwatch(state, light.toRgb()))
    }

    const color = tinycolor(hsl)
    row.push(colorSwatch(state, color.toRgb()))

    const dark = tinycolor(hsl)
    for (let k = 0; k < shades; k += 1) {
      dark.darken(100 / (shades * 2 + 2))
      row.push(colorSwatch(state, dark.toRgb()))
    }

    swatches.push(...row)
  }

  const rgbaInUseMap = new Map()
  imageDataUtils.forEachPixel(state.data, ([r, g, b, a]) => {
    const obj = { r, g, b, a }
    const key = `rgba(${r}, ${g}, ${b}, ${a})`

    if (!rgbaInUseMap.has(key) && a > 0) {
      rgbaInUseMap.set(key, obj)
    }
  })

  const swatchesInUse = [...rgbaInUseMap.values()]
    .sort((a, b) => {
      return tinycolor(a).toHsv().v > tinycolor(b).toHsv().v ? -1 : 1
    })
    .map(rgbaObj => {
      return colorSwatch(state, rgbaObj)
    })

  return html`
    <div class="color-swatches">
      <strong>palette</strong>
      <div class="all-colors">${swatches}</div>

      <strong>in use</strong>
      <div class="used-colors">${swatchesInUse}</div>
    </div>
  `
}

// ----------------------------------------
// Frames
// ----------------------------------------

function frames(state) {
  const canvas = html`
    <canvas width="32" height="32" style="background: #888;"></canvas>
  `
  return html`
    <div class="frames">
      ${canvas} ${canvas} ${canvas} ${canvas} ${canvas} ${canvas} ${canvas}
      ${canvas} ${canvas}
    </div>
  `
}

// ----------------------------------------
// Files
// ----------------------------------------

function files(state) {
  const spriteStates = storage.values()

  if (!spriteStates.length) {
    return null
  }

  return html`
    <div class="files">
      <h2>Files</h2>
      ${spriteStates.map(
        spriteState =>
          html`
            <button class="file">
              <i class="fas fa-upload"></i>
              ${spriteState.name || 'UNNAMED'}
            </button>
          `,
      )}
    </div>
  `
}

// ----------------------------------------
// Sprite Editor
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
  for (let i = 0; i < width - 1; i += cellSize) {
    ctx.fillRect(0, i + cellSize, width, 1)
  }

  // verticals
  for (let i = 0; i < height - 1; i += cellSize) {
    ctx.fillRect(i + cellSize, 0, 1, height)
  }

  return html`
    ${canvas}
  `
}

function spriteEditor(state) {
  return html`
    <div class="sprite-editor">
      <a class="header">
        ${spriteName(state)}
      </a>
      ${drawingTools(state)} ${actionTools(state)}

      <div class="stage">
        ${drawingCanvas(state)} ${gridCanvas(state)}
      </div>

      ${colorSwatches(state)} ${frames(state)} ${files(state)}
    </div>
  `
}

// ----------------------------------------
// Render
// ----------------------------------------

const mountNode = document.createElement('div')
document.body.appendChild(mountNode)

function renderHTML(html) {
  render(html, mountNode)
}

// ----------------------------------------
// Drawing Tools
// ----------------------------------------
const drawImageToCanvas = state => {
  const canvas = document.querySelector('.drawing-canvas')
  const ctx = canvas.getContext('2d')
  const imageData = new ImageData(state.data, state.width, state.height)
  ctx.putImageData(imageData, 0, 0)
}

const ACTION_TOOLS = {
  clear: {
    key: 'clear',
    icon: 'times-circle',
    label: 'Clear',
    onClick: (e, state) => {
      if (confirm('Are you sure you want to CLEAR your image?')) {
        setState({ data: imageDataUtils.clear(state.data) })
      }
    },
  },

  grid: {
    key: 'grid',
    icon: 'th',
    label: 'Grid',
    activeWhen: state => state.showGrid,
    onClick: (e, state) => {
      setState({ showGrid: !state.showGrid })
    },
  },
}

const DRAWING_TOOLS = {
  eraser: {
    key: 'eraser',
    icon: 'eraser',
    label: 'Eraser',
    draw(x, y, state) {
      const empty = [0, 0, 0, 0]

      setState({
        data: imageDataUtils.drawPixel(state.data, state.width, x, y, empty),
      })
    },
    onStart: (x, y, state) => {
      DRAWING_TOOLS.eraser.draw(x, y, state)
    },
    onMove: (x, y, state) => {
      DRAWING_TOOLS.eraser.draw(x, y, state)
    },
  },

  line: {
    key: 'line',
    icon: 'slash',
    label: 'Line',
    draw(x2, y2, state) {
      const { startX, startY, startData } = DRAWING_TOOLS.line

      setState({
        data: imageDataUtils.line(
          startData,
          state.width,
          startX,
          startY,
          x2,
          y2,
          state.color,
        ),
      })
    },
    onStart: (x, y, state) => {
      DRAWING_TOOLS.line.startX = x
      DRAWING_TOOLS.line.startY = y
      DRAWING_TOOLS.line.startData = state.image.data

      DRAWING_TOOLS.line.draw(x, y, state)
    },
    onMove: (x, y, state) => {
      DRAWING_TOOLS.line.draw(x, y, state)
    },
  },

  pencil: {
    key: 'pencil',
    icon: 'pencil-alt',
    label: 'Pencil',
    draw(x, y, state) {
      setState({
        data: imageDataUtils.drawPixel(
          state.data,
          state.width,
          x,
          y,
          state.color,
        ),
      })
    },
    onStart: (x, y, state) => {
      DRAWING_TOOLS.pencil.draw(x, y, state)
    },
    onMove: (x, y, state) => {
      DRAWING_TOOLS.pencil.draw(x, y, state)
    },
  },
}

// ----------------------------------------
// State
// ----------------------------------------

const DEFAULT_WIDTH = 8
const DEFAULT_HEIGHT = 8

const DEFAULT_STATE = {
  uid: Date.now().toString(36),
  name: 'New Sprite',
  tool: DRAWING_TOOLS.pencil.key,
  color: [0, 0, 0, 255],
  scale: 32,
  width: DEFAULT_WIDTH,
  height: DEFAULT_HEIGHT,
  data: imageDataUtils.newArray(DEFAULT_HEIGHT * DEFAULT_WIDTH * 4),
}

// debugger

// load
const lastState = storage.first()
const lastStateJSON = lastState ? stateFromJSON(lastState) : null

const INITIAL_STATE = lastStateJSON ? lastStateJSON : DEFAULT_STATE

let state = INITIAL_STATE
window.state = state

let undos = []
let redos = []

function setState(partial = {}) {
  undos.push(state)
  redos = []
  state = Object.assign({}, state, partial)

  console.log('setState', state)

  // Order mostly matters here:
  // 1. storage MUST updated before UI can read from it
  // 2. UI SHOULD be rendered before canvas is drawn
  // 3. draw on canvas AFTER it is rendered
  if (partial !== INITIAL_STATE) save(state)
  renderHTML(spriteEditor(state))
  drawImageToCanvas(state)
}

function undo() {
  console.log('undo')
  if (undos.length) {
    redos.push(state)
    state = undos.pop()
  }
}

function redo() {
  console.log('redo')
  if (redos.length) {
    undos.push(state)
    state = redos.pop()
  }
}

setState(state)

//
// Global Listeners
//
document.addEventListener('mousedown', e => {
  if (e.target.classList.contains('drawing-canvas')) {
    setState({ isDrawing: true })
    const tool = DRAWING_TOOLS[state.tool]
    const x = Math.floor(e.layerX / state.scale)
    const y = Math.floor(e.layerY / state.scale)

    if (tool.onStart) tool.onStart(x, y, state)
  }
})
document.addEventListener('mousemove', e => {
  if (state.isDrawing && e.target.classList.contains('drawing-canvas')) {
    const tool = DRAWING_TOOLS[state.tool]
    const x = Math.floor(e.layerX / state.scale)
    const y = Math.floor(e.layerY / state.scale)

    if (tool.onMove) tool.onMove(x, y, state)
  }
})
document.addEventListener('mouseup', e => {
  if (state.isDrawing) {
    const tool = DRAWING_TOOLS[state.tool]
    const x = Math.floor(e.layerX / state.scale)
    const y = Math.floor(e.layerY / state.scale)

    if (tool.onEnd) tool.onEnd(x, y, state)

    setState({ isDrawing: false })
  }
})
document.addEventListener('keydown', e => {
  switch (e.key) {
    case 'p':
      setState({ tool: DRAWING_TOOLS.pencil.key })
      break
    case 'e':
      setState({ tool: DRAWING_TOOLS.eraser.key })
      break
    case 'l':
      setState({ tool: DRAWING_TOOLS.line.key })
      break
    case 'g':
      setState({ showGrid: !state.showGrid })
      break
  }
})

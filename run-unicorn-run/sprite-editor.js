import { classMap } from 'https://unpkg.com/lit-html/directives/class-map.js?module'
import { styleMap } from 'https://unpkg.com/lit-html/directives/style-map.js?module'
import {
  html,
  render,
} from 'https://unpkg.com/lit-html@1.0.0/lit-html.js?module'
import tinycolor from './tinycolor.js'

// ----------------------------------------
// Sprite Image
// ----------------------------------------

class SpriteImage {
  /**
   * @param {number} width
   * @param {number} height
   * @param {Uint8ClampedArray} array
   */
  constructor(
    width = 32,
    height = 32,
    array = new Uint8ClampedArray(4 * width * height),
  ) {
    this._imageData = new ImageData(array, width, height)
  }

  // TODO allow set width/height and clip/fill imageData accordingly
  get width() {
    return this._imageData.width
  }

  get height() {
    return this._imageData.height
  }

  get imageData() {
    return this._imageData
  }

  set imageData(val) {
    this._imageData = val
  }

  mapPixels(cb = x => x) {
    const data = this.imageData.data
    const length = this.imageData.data.length
    const array = new Uint8ClampedArray(length)

    for (let i = 0; i < length; i += 4) {
      const pixel = cb(
        [
          data[i + 0], // r
          data[i + 1], // g
          data[i + 2], // b
          data[i + 3], // a
        ],
        i,
        data,
      )

      if (Array.isArray(pixel)) {
        array[i + 0] = pixel[0]
        array[i + 1] = pixel[1]
        array[i + 2] = pixel[2]
        array[i + 3] = pixel[3]
      }
    }

    return new ImageData(array, this.width, this.height)
  }

  clear() {
    this.fill(0, 0, 0, 0)
  }

  fill(r = 0, g = 0, b = 0, a = 255) {
    this.imageData = this.mapPixels(() => [r, g, b, a])
  }

  line(x1, y1, x2, y2, [r, g, b, a]) {
    const dx = Math.abs(x2 - x1)
    const sx = x1 < x2 ? 1 : -1
    const dy = -Math.abs(y2 - y1)
    const sy = y1 < y2 ? 1 : -1

    let done
    let e2
    let er = dx + dy

    while (!done) {
      this.setPixel(x1, y1, [r, g, b, a])

      if (x1 === x2 && y1 === y2) {
        done = true
      } else {
        e2 = 2 * er
        if (e2 > dy) {
          er += dy
          x1 += sx
        }
        if (e2 < dx) {
          er += dx
          y1 += sy
        }
      }
    }
  }

  getIndexFromXY(x, y) {
    return (y * this.width + x) * 4
  }

  getPixel(x, y) {
    const i = this.getIndexFromXY(x, y)

    return [
      this.imageData.data[i + 0], // r
      this.imageData.data[i + 1], // g
      this.imageData.data[i + 2], // b
      this.imageData.data[i + 3], // a
    ]
  }

  setPixel(x, y, [r, g, b, a]) {
    const i = this.getIndexFromXY(x, y)

    this.imageData.data[i + 0] = r
    this.imageData.data[i + 1] = g
    this.imageData.data[i + 2] = b
    this.imageData.data[i + 3] = a
  }

  draw(array) {
    this.imageData = this.mapPixels((pixel, i) => {
      return [
        array[i + 0], // r
        array[i + 1], // g
        array[i + 2], // b
        array[i + 3], // a
      ]
    })
  }
}

window.SpriteImage = SpriteImage

// ----------------------------------------
// Name
// ----------------------------------------

function spriteName(state) {
  return html`
    <i class="far fa-image"></i> ${state.name}
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
// View Tools
// ----------------------------------------
function viewTool(state, { key, icon, label, onClick, activeWhen }) {
  return html`
    <button
      ?disabled=${!VIEW_TOOLS[key]}
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

function viewTools(state) {
  return html`
    <div class="view-tools">
      ${viewTool(state, { key: 'undo', icon: 'undo' })}
      ${viewTool(state, { key: 'redo', icon: 'redo' })}

      <div class="divider"></div>

      ${viewTool(state, { key: 'zoom-in', icon: 'search-plus' })}
      ${viewTool(state, { key: 'zoom-out', icon: 'search-minus' })}

      <div class="divider"></div>

      ${viewTool(state, VIEW_TOOLS.clear)}
      ${viewTool(state, VIEW_TOOLS.grid)}
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

  return html`
    <div class="color-swatches">
      ${swatches}
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
  const spriteStates = Object.keys(localStorage).map(key => {
    return JSON.parse(localStorage[key])
  })

  if (!spriteStates.length) {
    return null
  }

  console.log(spriteStates)
  return html`
    <div class="files">
      <h1>Files</h1>
      ${spriteStates.map(spriteState => spriteState.name)}
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
  ctx.globalCompositeOperation = 'difference'
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
      ${drawingTools(state)} ${viewTools(state)}

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
/** @returns {CanvasRenderingContext2D} */
const ctx = () => {
  const canvas = document.querySelector('.drawing-canvas')

  return canvas.getContext('2d')
}

const drawDataOnCanvas = state => {
  ctx().putImageData(state.image.imageData, 0, 0)
}

const clearCanvas = state => {
  ctx().clearRect(0, 0, state.width, state.height)
}

const VIEW_TOOLS = {
  clear: {
    key: 'clear',
    icon: 'times-circle',
    label: 'Clear',
    onClick: (e, state) => {
      ctx().clearRect(0, 0, state.width, state.height)
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
  pencil: {
    key: 'pencil',
    icon: 'pencil-alt',
    label: 'Pencil',
    draw(x, y, state) {
      state.image.setPixel(x, y, state.color)
      drawDataOnCanvas(state)
    },
    onStart: (x, y, state) => {
      DRAWING_TOOLS.pencil.draw(x, y, state)
    },
    onMove: (x, y, state) => {
      DRAWING_TOOLS.pencil.draw(x, y, state)
    },
  },

  eraser: {
    key: 'eraser',
    icon: 'eraser',
    label: 'Eraser',
    draw(x, y, state) {
      const emptyPixel = new ImageData(
        new Uint8ClampedArray([0, 0, 0, 0]),
        1,
        1,
      )

      ctx().putImageData(emptyPixel, x, y)
    },
    onStart: (x, y, state) => {
      DRAWING_TOOLS.eraser.draw(x, y)
    },
    onMove: (x, y, state) => {
      DRAWING_TOOLS.eraser.draw(x, y)
    },
  },

  line: {
    key: 'line',
    icon: 'slash',
    label: 'Line',
    draw(x2, y2, state) {
      const { startX, startY, startData, image } = DRAWING_TOOLS.line
      image.clear()
      image.draw(startData)
      image.line(startX, startY, x2, y2, state.color)

      ctx().clearRect(0, 0, state.width, state.height)
      ctx().putImageData(image.imageData, 0, 0)
    },

    onStart: (x, y, state) => {
      DRAWING_TOOLS.line.startX = x
      DRAWING_TOOLS.line.startY = y
      DRAWING_TOOLS.line.startData = ctx().getImageData(
        0,
        0,
        state.width,
        state.height,
      ).data
      DRAWING_TOOLS.line.image = new SpriteImage(state.width, state.height)

      DRAWING_TOOLS.line.draw(x, y, state)
    },
    onMove: (x, y, state) => {
      DRAWING_TOOLS.line.draw(x, y, state)
    },
    oneEnd: (x, y, state) => {
      DRAWING_TOOLS.line.draw(x, y, state)
    },
  },
}

document.addEventListener('mousedown', e => {
  if (e.target.classList.contains('drawing-canvas')) {
    setState({ isDrawing: true })
    const tool = DRAWING_TOOLS[state.tool]

    if (tool.onStart) {
      const x = Math.floor(e.layerX / state.scale)
      const y = Math.floor(e.layerY / state.scale)
      tool.onStart(x, y, state)
    }
  }
})
document.addEventListener('mousemove', e => {
  if (state.isDrawing && e.target.classList.contains('drawing-canvas')) {
    const tool = DRAWING_TOOLS[state.tool]

    if (tool.onMove) {
      const x = Math.floor(e.layerX / state.scale)
      const y = Math.floor(e.layerY / state.scale)
      tool.onMove(x, y, state)
    }
  }
})
document.addEventListener('mouseup', e => {
  if (state.isDrawing) {
    const tool = DRAWING_TOOLS[state.tool]

    if (tool.onEnd) {
      const x = Math.floor(e.layerX / state.scale)
      const y = Math.floor(e.layerY / state.scale)
      tool.onEnd(x, y, state)
    }

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

// ----------------------------------------
// State
// ----------------------------------------

const INITIAL_WIDTH = 8
const INITIAL_HEIGHT = 8

let state = {
  name: 'sprApple',
  tool: DRAWING_TOOLS.pencil.key,
  color: [0, 0, 0, 255],
  scale: 32,
  width: INITIAL_WIDTH,
  height: INITIAL_HEIGHT,
  image: new SpriteImage(INITIAL_WIDTH * INITIAL_HEIGHT * 4),
}
window.state = state

let undos = []
let redos = []

function setState(partial = {}) {
  undos.push(state)
  redos = []
  state = Object.assign({}, state, partial)

  console.log('setState', state)

  renderHTML(spriteEditor(state))
  saveSprite(state)
}

// ----------------------------------------
// Storage
// ----------------------------------------
function saveSprite(state) {
  const imageData = ctx().getImageData(0, 0, state.width, state.height)
  localStorage.setItem(
    state.name,
    JSON.stringify({ name: state.name, imageData }, null, 2),
  )
}

function undo() {
  if (undos.length) {
    redos.push(state)
    state = undos.pop()
  }
}

function redo() {
  if (redos.length) {
    undos.push(state)
    state = redos.pop()
  }
}

setState(state)

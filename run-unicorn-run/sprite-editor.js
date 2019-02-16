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

class ImmutableSpriteImage {
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
    Object.defineProperty(this, '_imageData', {
      value: new ImageData(array, width, height),
      enumerable: false,
      configurable: false,
      writable: false,
    })
  }

  get width() {
    return this._imageData.width
  }

  get height() {
    return this._imageData.height
  }

  /** @returns {Uint8ClampedArray} */
  get data() {
    return this._imageData.data.slice()
  }

  get imageData() {
    return new ImageData(this.data, this.width, this.height)
  }

  clear() {
    return this.fill(0, 0, 0, 0)
  }

  clone() {
    return new ImmutableSpriteImage(this.width, this.height, this.data)
  }

  fill(r = 0, g = 0, b = 0, a = 255) {
    return this.mapDataByPixel(() => [r, g, b, a])
  }

  getIndexFromXY(x, y) {
    return (y * this.width + x) * 4
  }

  getPixel(x, y) {
    const i = this.getIndexFromXY(x, y)
    const dataCopy = this.data

    return [
      dataCopy[i + 1], // r
      dataCopy[i + 2], // g
      dataCopy[i + 3], // b
      dataCopy[i + 0], // a
    ]
  }

  drawPixel(x, y, [r, g, b, a]) {
    const i = this.getIndexFromXY(x, y)
    const dataCopy = this.data

    dataCopy[i + 0] = r
    dataCopy[i + 1] = g
    dataCopy[i + 2] = b
    dataCopy[i + 3] = a

    return new ImmutableSpriteImage(this.width, this.height, dataCopy)
  }

  line(x1, y1, x2, y2, [r, g, b, a]) {
    let clone = this.clone()

    const dx = Math.abs(x2 - x1)
    const sx = x1 < x2 ? 1 : -1
    const dy = -Math.abs(y2 - y1)
    const sy = y1 < y2 ? 1 : -1

    let done
    let e2
    let er = dx + dy

    while (!done) {
      clone = clone.drawPixel(x1, y1, [r, g, b, a])

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

    return clone
  }

  mapDataByPixel(cb = x => x) {
    const data = this._imageData.data
    const length = this._imageData.data.length
    const array = new Uint8ClampedArray(length)

    for (let i = 0; i < length; i += 4) {
      const [r = 0, g = 0, b = 0, a = 0] =
        cb(
          [
            data[i + 0], // r
            data[i + 1], // g
            data[i + 2], // b
            data[i + 3], // a
          ],
          i,
          data,
        ) || []

      array[i + 0] = r
      array[i + 1] = g
      array[i + 2] = b
      array[i + 3] = a
    }

    return new ImmutableSpriteImage(this.width, this.height, array)
  }

  /**
   * @param {Uint8ClampedArray} array
   * @returns {ImmutableSpriteImage}
   */
  drawData(array) {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const { width, height } = this

    const imageData = new ImageData(array, width, height)
    ctx.putImageData(imageData, 0, 0)

    const { data } = ctx.getImageData(0, 0, width, height)

    return new ImmutableSpriteImage(width, height, data)
  }
}

window.SpriteImage = ImmutableSpriteImage

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
/** @returns {CanvasRenderingContext2D} */
const ctx = () => {
  const canvas = document.querySelector('.drawing-canvas')

  return canvas.getContext('2d')
}

const drawImageToCanvas = () => {
  ctx().putImageData(state.image.imageData, 0, 0)
}

const ACTION_TOOLS = {
  clear: {
    key: 'clear',
    icon: 'times-circle',
    label: 'Clear',
    onClick: (e, state) => {
      setState({ image: state.image.clear() })
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
      setState({ image: state.image.drawPixel(x, y, [0, 0, 0, 0]) })
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

      let image = new ImmutableSpriteImage(state.width, state.height, startData)

      setState({ image: image.line(startX, startY, x2, y2, state.color) })
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
    oneEnd: (x, y, state) => {
      DRAWING_TOOLS.line.draw(x, y, state)
    },
  },

  pencil: {
    key: 'pencil',
    icon: 'pencil-alt',
    label: 'Pencil',
    draw(x, y, state) {
      setState({ image: state.image.drawPixel(x, y, state.color) })
    },
    onStart: (x, y, state) => {
      DRAWING_TOOLS.pencil.draw(x, y, state)
    },
    onMove: (x, y, state) => {
      DRAWING_TOOLS.pencil.draw(x, y, state)
    },
  },
}

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
  image: new ImmutableSpriteImage(INITIAL_WIDTH, INITIAL_HEIGHT),
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
  drawImageToCanvas()
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

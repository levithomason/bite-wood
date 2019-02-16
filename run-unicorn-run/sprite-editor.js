import { classMap } from 'https://unpkg.com/lit-html/directives/class-map.js?module'
import {
  html,
  render,
} from 'https://unpkg.com/lit-html@1.0.0/lit-html.js?module'
// assigns window.tinycolor
import 'https://unpkg.com/tinycolor2@1.4.1/tinycolor.js'
import { GameDrawing } from './core/game/index.js'

// ----------------------------------------
// Sprite Image
// ----------------------------------------

class SpriteImage {
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

  mapPixels(cb) {
    const data = this.imageData.data
    const length = this.imageData.data.length
    const array = new Uint8ClampedArray(length)

    for (let i = 0; i < length; i += 4) {
      const [r, g, b, a] = cb(
        [
          data[i + 0], // r
          data[i + 1], // g
          data[i + 2], // b
          data[i + 3], // a
        ],
        i,
        data,
      )

      array[i + 0] = r
      array[i + 1] = g
      array[i + 2] = b
      array[i + 3] = a
    }

    return new ImageData(array, this.width, this.height)
  }

  fill(r = 0, g = 0, b = 0, a = 255) {
    this.imageData = this.mapPixels(() => [r, g, b, a])
  }

  getIndexFromXY(x, y) {
    return y * this.width + x
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

// ----------------------------------------
// Colors
// ----------------------------------------

function colorSwatch({ r = 0, g = 0, b = 0, a = 1 } = {}) {
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

function colorSwatches() {
  const deg = 360

  const hues = 12
  const step = deg / hues

  const tints = 4
  const shades = 4

  const swatches = []

  for (let i = 0; i < hues; i += 1) {
    const row = []
    const hsl = { h: i * step, s: 100, l: 50 }

    const light = tinycolor(hsl)
    for (let j = 0; j < tints; j += 1) {
      light.lighten(100 / (tints * 2 + 2))
      row.unshift(colorSwatch(light.toRgb()))
    }

    const color = tinycolor(hsl)
    row.push(colorSwatch(color.toRgb()))

    const dark = tinycolor(hsl)
    for (let k = 0; k < shades; k += 1) {
      dark.darken(100 / (shades * 2 + 2))
      row.push(colorSwatch(dark.toRgb()))
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
// Tools
// ----------------------------------------

function toolButton({ name, icon, label }) {
  const handleClick = {
    handleEvent(e) {
      setState({ tool: name })
    },

    capture: true,
  }

  return html`
    <button
      ?disabled=${!tools[name]}
      class="tool ${classMap({ active: state.tool === name })}"
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

function viewTools() {
  return html`
    <div class="view-tools">
      ${toolButton({ name: 'undo', icon: 'undo' })}
      ${toolButton({ name: 'redo', icon: 'redo' })}

      <div class="divider"></div>

      ${toolButton({ name: 'zoom-in', icon: 'search-plus' })}
      ${toolButton({ name: 'zoom-out', icon: 'search-minus' })}

      <div class="divider"></div>

      ${toolButton({ name: 'clear', icon: 'times-circle', label: 'Clear' })}
      ${toolButton({ name: 'grid', icon: 'th', label: 'Grid' })}
    </div>
  `
}

function drawingTools() {
  return html`
    <div class="drawing-tools">
      ${toolButton({ name: 'pencil', icon: 'pencil-alt', label: 'Pencil' })}
      ${toolButton({ name: 'eraser', icon: 'eraser', label: 'Eraser' })}

      <div class="divider"></div>

      ${toolButton({ name: 'eye-dropper', icon: 'eye-dropper', label: 'Pick' })}
      ${toolButton({ name: 'brush', icon: 'brush', label: 'Brush' })}
      ${toolButton({ name: 'fill', icon: 'fill-drip', label: 'Fill' })}
      ${toolButton({ name: 'spray', icon: 'spray-can', label: 'Spray' })}

      <div class="divider"></div>

      ${toolButton({ name: 'circle', icon: 'circle', label: 'Circle' })}
      ${toolButton({ name: 'square', icon: 'square', label: 'Square' })}
      ${toolButton({ name: 'line', icon: 'slash', label: 'Line' })}

      <div class="divider"></div>

      ${toolButton({ name: 'spline', icon: 'bezier-curve', label: 'Spline' })}
      ${toolButton({ name: 'polygon', icon: 'draw-polygon', label: 'Polygon' })}
    </div>
  `
}

// ----------------------------------------
// Name
// ----------------------------------------

function spriteName() {
  return html`
    <i class="far fa-image"></i> ${state.name}
  `
}

// ----------------------------------------
// Frames
// ----------------------------------------

function frames() {
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
// Sprite Editor
// ----------------------------------------

function spriteEditor() {
  return html`
    <div class="sprite-editor">
      <a class="header">
        ${spriteName()}
      </a>
      ${drawingTools()} ${viewTools()}

      <div class="stage">
        ${state.drawing.canvas}
      </div>

      ${colorSwatches()} ${frames()}
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

function drawImageOnCanvas(state) {
  const { drawing, scale } = state

  const zoomWidth = drawing.canvas.width * scale
  const zoomHeight = drawing.canvas.height * scale

  drawing.canvas.style.width = zoomWidth + 'px'
  drawing.canvas.style.height = zoomHeight + 'px'

  // TODO: grid button to toggle showGrid
  if (state.showGrid) {
    drawing.grid(8)
  }
}

const tools = {
  pencil: {
    key: 'pencil',
    icon: 'pencil-alt',
    label: 'Pencil',
    draw(x, y, color = state.color) {
      tools.pencil.imageData = new ImageData(new Uint8ClampedArray(color), 1, 1)
      console.log(tools.pencil.imageData)
      drawing.imageData(tools.pencil.imageData, x, y)
    },
    onStart: (x, y) => {
      tools.pencil.draw(x, y)
    },
    onMove: (x, y) => {
      tools.pencil.draw(x, y)
    },
  },
  eraser: {
    key: 'eraser',
    icon: 'eraser',
    label: 'Eraser',
    onStart: (x, y) => {
      tools.pencil.draw(x, y, [0, 0, 0, 0])
    },
    onMove: (x, y) => {
      tools.pencil.draw(x, y, [0, 0, 0, 0])
    },
  },
}

const drawing = new GameDrawing(8, 8)

document.addEventListener('mousedown', e => {
  if (e.target === drawing.canvas) {
    setState({ isDrawing: true })
    const tool = tools[state.tool]

    if (tool && tool.onStart) {
      const x = Math.floor(e.layerX / state.scale)
      const y = Math.floor(e.layerY / state.scale)
      tool.onStart(x, y)
    }
  }
})
document.addEventListener('mousemove', e => {
  if (state.isDrawing && e.target === drawing.canvas) {
    const tool = tools[state.tool]

    if (tool && tool.onMove) {
      const x = Math.floor(e.layerX / state.scale)
      const y = Math.floor(e.layerY / state.scale)
      tool.onMove(x, y)
    }
  }
})
document.addEventListener('mouseup', e => {
  if (state.isDrawing) {
    const tool = tools[state.tool]

    if (tool && tool.onEnd) {
      const x = Math.floor(e.layerX / state.scale)
      const y = Math.floor(e.layerY / state.scale)
      tool.onEnd(x, y)
    }

    setState({ isDrawing: false })
  }
})

// ----------------------------------------
// State
// ----------------------------------------

let undos = []
let redos = []
let state = {
  tool: tools.pencil.key,
  drawing,
  name: 'sprApple',
  color: [0, 0, 0, 255],
  scale: 32,
}
window.state = state

function setState(partial = {}) {
  undos.push(state)
  redos = []
  state = Object.assign({}, state, partial)

  console.log('setState', state)

  renderHTML(spriteEditor())
  drawImageOnCanvas(state)
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

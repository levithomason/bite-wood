import { classMap } from 'https://unpkg.com/lit-html/directives/class-map.js?module'
import {
  html,
  render,
} from 'https://unpkg.com/lit-html@1.0.0/lit-html.js?module'
import 'https://unpkg.com/tinycolor2@1.4.1/tinycolor.js'

// ----------------------------------------
// Sprite Editor Image
// ----------------------------------------

class SpriteEditorImage {
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

  pixel(x, y) {
    const i = y * this.width + x

    return [
      this.imageData[i + 0], // r
      this.imageData[i + 1], // g
      this.imageData[i + 2], // b
      this.imageData[i + 3], // a
    ]
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

const image = new SpriteEditorImage()
image.fill(127, 64, 255)

window.image = image

// ----------------------------------------
// Colors
// ----------------------------------------

function colorSwatch({ r = 0, g = 0, b = 0, a = 1 } = {}) {
  const rgbString = tinycolor({ r, g, b, a }).toRgbString()

  const handleClick = {
    handleEvent(e) {
      setState({ foreground: rgbString })
    },

    capture: true,
  }

  return html`
    <button
      class="color-swatch ${classMap({
        active: state.foreground === rgbString,
      })}"
      style="background: ${rgbString};"
      @click=${handleClick}
    ></button>
  `
}

function colorSwatches() {
  const deg = 360

  const hues = 15
  const step = deg / hues

  const lights = 3
  const darks = 3

  const swatches = []

  for (let i = 0; i < hues; i += 1) {
    const row = []
    const hsl = { h: i * step, s: 100, l: 50 }

    const light = tinycolor(hsl)
    for (let j = 0; j < lights; j += 1) {
      light.lighten(100 / (lights * 2 + 2))
      row.unshift(colorSwatch(light.toRgb()))
    }

    const color = tinycolor(hsl)
    row.push(colorSwatch(color.toRgb()))

    const dark = tinycolor(hsl)
    for (let k = 0; k < darks; k += 1) {
      dark.darken(100 / (darks * 2 + 2))
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
window.tinycolor = tinycolor

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
      class="tool ${classMap({ active: state.tool === name })}"
      @click="${handleClick}"
    >
      <i class="fas fa-${icon}"></i>
      <span class="label">${label}</span>
    </button>
  `
}

function viewTools() {
  return html`
    <div class="view-tools">
      ${toolButton({ name: 'undo', icon: 'undo', label: 'Undo' })}
      ${toolButton({ name: 'redo', icon: 'redo', label: 'Redo' })}

      <div class="divider"></div>

      ${toolButton({ name: 'clear', icon: 'times-circle', label: 'Clear' })}
      ${toolButton({ name: 'grid', icon: 'th', label: 'Grid' })}
    </div>
  `
}

function drawingTools() {
  return html`
    <div class="drawing-tools">
      ${toolButton({ name: 'pencil', icon: 'pen', label: 'Pencil' })}
      ${toolButton({ name: 'brush', icon: 'brush', label: 'Brush' })}
      ${toolButton({ name: 'fill', icon: 'fill-drip', label: 'Fill' })}
      ${toolButton({ name: 'spray', icon: 'spray-can', label: 'Spray' })}

      <div class="divider"></div>

      ${toolButton({ name: 'eraser', icon: 'eraser', label: 'Eraser' })}

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
      ${drawingTools()} ${viewTools()}

      <div class="stage">
        <canvas
          class="image-canvas"
          width=${state.width}
          height=${state.height}
        ></canvas>
      </div>

      ${colorSwatches()} ${frames()}
    </div>
  `
}

// ----------------------------------------
// Render & State
// ----------------------------------------

const mountNode = document.createElement('div')
document.body.appendChild(mountNode)

function renderHTML(html) {
  render(html, mountNode)
}

function draw(state) {
  const imageCanvas = document.querySelector('.image-canvas')
  const ctx = imageCanvas.getContext('2d')
  ctx.putImageData(image.imageData, 0, 0)
}

let state = {
  image,
  foreground: '#fff',
  background: '#000',
  width: 32,
  height: 32,
  scale: 1,
}
window.state = state

function setState(partial = {}) {
  state = Object.assign({}, state, partial)
  console.log('setState', state)
  renderHTML(spriteEditor())
  draw(state)
}

setState(state)

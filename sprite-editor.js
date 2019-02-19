import * as imageDataUtils from './imageDataUtils.js'
import { classMap } from './node_modules/lit-html/directives/class-map.js'
import { styleMap } from './node_modules/lit-html/directives/style-map.js'
import { html, render } from './node_modules/lit-html/lit-html.js'

import storage from './storage.js'
import tinycolor from './tinycolor.js'

const SETTINGS = {
  MAX_UNDOS: 100,
  MAX_ZOOM: 32,
  MIN_ZOOM: 1,
  DEFAULT_WIDTH: 8,
  DEFAULT_HEIGHT: 8,
}

// ----------------------------------------
// Name
// ----------------------------------------

function spriteName(state) {
  const handleInput = {
    handleEvent(e) {
      setState({ name: e.target.value })
    },

    capture: true,
  }

  const handleKeyDown = e => {
    if (e.key === 'Enter') {
      e.target.blur()
    }
  }

  return html`
    <div class="sprite-name">
      <i class="fas fa-image"></i>
      <input
        @input=${handleInput}
        @keydown=${handleKeyDown}
        value=${state.name}
        placeholder=${'Name your sprite...'}
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
      class="button tool ${classMap({ active: state.tool === key })}"
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
      <div class="tool-group">
        ${drawingTool(state, DRAWING_TOOLS.pencil)}
        ${drawingTool(state, DRAWING_TOOLS.eraser)}
      </div>

      <div class="tool-group">
        ${drawingTool(state, DRAWING_TOOLS.eyeDropper)}
        ${drawingTool(state, { key: 'brush', icon: 'brush', label: 'Brush' })}
        ${drawingTool(state, { key: 'fill', icon: 'fill-drip', label: 'Fill' })}
        ${drawingTool(state, {
          key: 'spray',
          icon: 'spray-can',
          label: 'Spray',
        })}
      </div>

      <div class="tool-group">
        ${drawingTool(state, {
          key: 'circle',
          icon: 'circle',
          label: 'Circle',
        })}
        ${drawingTool(state, {
          key: 'square',
          icon: 'square',
          label: 'Square',
        })}
        ${drawingTool(state, DRAWING_TOOLS.line)}
      </div>

      <div class="tool-group">
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
    </div>
  `
}

// ----------------------------------------
// Action Tools
// ----------------------------------------

function actionTool(
  state,
  { key, icon, label, disabledWhen, onClick, activeWhen },
) {
  const handleClick = e => {
    onClick(e, state)
  }

  return html`
    <button
      ?disabled=${!ACTION_TOOLS[key] || (disabledWhen && disabledWhen(state))}
      class="button tool ${classMap({
        active: activeWhen && activeWhen(state),
      })}"
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

function actionTools(state) {
  return html`
    <div class="action-tools">
      <div class="tool-group">
        ${actionTool(state, { key: 'undo', icon: 'undo' })}
        ${actionTool(state, { key: 'redo', icon: 'redo' })}
      </div>
      <div class="tool-group">
        ${actionTool(state, ACTION_TOOLS.zoomIn)}
        ${actionTool(state, ACTION_TOOLS.zoomOut)}
      </div>
      <div class="tool-group">
        ${actionTool(state, ACTION_TOOLS.clear)}
        ${actionTool(state, ACTION_TOOLS.grid)}
      </div>
      <div class="tool-group">
        ${actionTool(state, {
          key: 'download',
          icon: 'download',
          label: 'Download',
        })}
      </div>
    </div>
  `
}

// ----------------------------------------
// Colors
// ----------------------------------------

function colorSwatch(state, { r = 0, g = 0, b = 0, a = 1 } = {}) {
  const a255 = a * 255

  const handleClick = e => {
    setState({
      color: [r, g, b, a255],
      tool:
        // if choosing a color while on eraser or eye dropper, go back to prev tool or pencil
        state.tool === DRAWING_TOOLS.eraser.key ||
        state.tool === DRAWING_TOOLS.eyeDropper.key
          ? state.prevTool || DRAWING_TOOLS.pencil.key
          : state.tool,
    })
  }

  return html`
    <button
      class="button color-swatch ${classMap({
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
  imageDataUtils.forEachPixel(state.frameDataDrawing, ([r, g, b, a255]) => {
    const a = a255 / 255
    const obj = { r, g, b, a }
    const key = `rgba(${r}, ${g}, ${b}, ${a255})`

    if (!rgbaInUseMap.has(key) && a255 > 0) {
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
      <div class="header">Used colors</div>
      <div class="used-colors">
        ${swatchesInUse.length ? swatchesInUse : '...'}
      </div>

      <div class="header">All colors</div>
      <div class="all-colors">${swatches}</div>
    </div>
  `
}

// ----------------------------------------
// Frames
// ----------------------------------------

function HACK__playLoop() {
  window.HACK__playLoopTimer = setTimeout(() => {
    setState({
      frameIndexDrawing: (state.frameIndexDrawing + 1) % state.frames.length,
    })
    HACK__playLoop()
  }, 200)
}

function frames(state) {
  function handleAddFrameClick(e) {
    addFrame(state)
  }

  function handlePlayClick(e) {
    if (state.HACK__isPlaying) {
      setState({ HACK__isPlaying: false })
      clearInterval(window.HACK__playLoopTimer)
    } else {
      setState({ HACK__isPlaying: true })
      HACK__playLoop()
    }
  }

  return html`
    <div class="frames">
      <button class="button frame play" @click=${handlePlayClick}>
        <i class="fas fa-${state.HACK__isPlaying ? 'pause' : 'play'}"></i>
      </button>

      ${state.frames.map((frameData, i) => {
        const canvas = document.createElement('canvas')
        canvas.width = state.width
        canvas.height = state.height

        const imageData = new ImageData(frameData, state.width, state.height)

        const ctx = canvas.getContext('2d')
        ctx.putImageData(imageData, 0, 0)

        return html`
          <button
            @click="${e => {
              setState({ frameIndexDrawing: i })
            }}"
            class="button frame ${classMap({
              active: i === state.frameIndexDrawing,
            })}"
          >
            ${canvas}
          </button>
        `
      })}
      <button class="button frame add-frame" @click=${handleAddFrameClick}>
        <i class="fas fa-plus-circle"></i>
      </button>
    </div>
  `
}

// ----------------------------------------
// Files
// ----------------------------------------

function files(state) {
  const spriteStates = storage.values().map(json => State.fromJSON(json))

  if (!spriteStates.length) {
    return null
  }

  function handleClick(e) {
    const spriteStateUID = e.target.getAttribute('data-sprite-state-uid')

    if (state.uid !== spriteStateUID) {
      setState(loadState(spriteStateUID))
    }
  }

  function handleNewClick(e) {
    setState(new State())
  }

  return html`
    <div class="files">
      <h2>My Sprites</h2>
      ${spriteStates.map(spriteState => {
        const isActive = spriteState.uid === state.uid

        // TODO: make canvas component, we're drawing data inline a lot
        const canvas = document.createElement('canvas')
        canvas.width = state.width
        canvas.height = state.height

        const imageData = new ImageData(
          spriteState.frames[0],
          state.width,
          state.height,
        )

        const ctx = canvas.getContext('2d')
        ctx.putImageData(imageData, 0, 0)

        return html`
          <button
            data-sprite-state-uid="${spriteState.uid}"
            @click=${handleClick}
            class="button file ${classMap({ active: isActive })}"
          >
            ${canvas} ${spriteState.name || 'UNNAMED'}
          </button>
        `
      })}
      <button class="button file" @click=${handleNewClick}>
        <i class="fas fa-plus-circle"></i>
        New
      </button>
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
      <a class="sprite-editor-header">
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
mountNode.id = '#root'
document.body.appendChild(mountNode)

function renderHTML(html) {
  render(html, mountNode)
}

// ----------------------------------------
// Actions
// ----------------------------------------

const drawImageToCanvas = state => {
  const canvas = document.querySelector('.drawing-canvas')
  const ctx = canvas.getContext('2d')
  const imageData = new ImageData(
    state.frameDataDrawing,
    state.width,
    state.height,
  )
  ctx.putImageData(imageData, 0, 0)
}

function addFrame(state) {
  setState({
    frames: [
      ...state.frames,
      imageDataUtils.arrayFrom(state.height * state.width * 4),
    ],
    frameIndexDrawing: state.frames.length,
  })
}

function zoomIn(state) {
  setState({ scale: Math.min(SETTINGS.MAX_ZOOM, state.scale * 1.5) })
}

function zoomOut(state) {
  setState({
    scale: Math.max(SETTINGS.MIN_ZOOM, Math.round(state.scale / 1.5)),
  })
}

// ----------------------------------------
// Tools
// ----------------------------------------

const ACTION_TOOLS = {
  clear: {
    key: 'clear',
    icon: 'times-circle',
    label: 'Clear',
    onClick: (e, state) => {
      if (confirm('Are you sure you want to CLEAR your image?')) {
        setState({
          frameDataDrawing: imageDataUtils.clear(state.frameDataDrawing),
        })
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

  zoomIn: {
    key: 'zoomIn',
    icon: 'search-plus',
    disabledWhen: state => state.scale >= SETTINGS.MAX_ZOOM,
    onClick: (e, state) => {
      zoomIn(state)
    },
  },

  zoomOut: {
    key: 'zoomOut',
    icon: 'search-minus',
    disabledWhen: state => state.scale <= SETTINGS.MIN_ZOOM,
    onClick: (e, state) => {
      zoomOut(state)
    },
  },
}

// 1, 2, 4, 8, 12, 16, 24, 32
// 1, 2, 4, 4, 4,  4,  6,  6
const DRAWING_TOOLS = {
  eraser: {
    key: 'eraser',
    icon: 'eraser',
    label: 'Eraser',
    draw(x, y, state) {
      const empty = [0, 0, 0, 0]

      setState({
        frameDataDrawing: imageDataUtils.drawPixel(
          state.frameDataDrawing,
          state.width,
          x,
          y,
          empty,
        ),
      })
    },
    onStart: (x, y, state) => {
      DRAWING_TOOLS.eraser.draw(x, y, state)
    },
    onMove: (x, y, state) => {
      DRAWING_TOOLS.eraser.draw(x, y, state)
    },
  },

  eyeDropper: {
    key: 'eyeDropper',
    icon: 'eye-dropper',
    label: 'Pick',
    onEnd(x, y, state) {
      setState({
        color: imageDataUtils.getPixel(
          state.frameDataDrawing,
          state.width,
          x,
          y,
        ),
        tool: state.prevTool,
      })
    },
  },

  line: {
    key: 'line',
    icon: 'slash',
    label: 'Line',
    draw(x2, y2, state) {
      const { startX, startY, startData } = DRAWING_TOOLS.line

      setState({
        frameDataDrawing: imageDataUtils.line(
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
      DRAWING_TOOLS.line.startData = state.frameDataDrawing

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
        frameDataDrawing: imageDataUtils.drawPixel(
          state.frameDataDrawing,
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
// Save / Load
// ----------------------------------------

function saveState(state) {
  const val = State.toJSON(state)
  storage.set(state.uid, val)
}

function loadState(uid) {
  const json = uid ? storage.get(uid) : storage.first()

  return new State(json)
}

// ----------------------------------------
// State
// ----------------------------------------
class State {
  static toJSON(state) {
    const json = {
      ...state,
      frames: state.frames.map(frame => new Array(...frame)),
    }

    delete json.frameDataDrawing
    delete json.toJSON

    return json
  }

  static fromJSON = json => {
    return {
      ...json,
      frames: json.frames.map(frame => imageDataUtils.arrayFrom(frame)),
    }
  }

  constructor(json) {
    if (json) {
      Object.assign(this, State.fromJSON(json))
      return
    }

    this.uid = Date.now().toString(36)
    this.name = ''
    this.prevTool = ''
    this.tool = DRAWING_TOOLS.pencil.key
    this.color = [0, 0, 0, 255]
    this.scale = 32
    this.width = SETTINGS.DEFAULT_WIDTH
    this.height = SETTINGS.DEFAULT_HEIGHT
    this.frames = [
      imageDataUtils.arrayFrom(
        SETTINGS.DEFAULT_HEIGHT * SETTINGS.DEFAULT_WIDTH * 4,
      ),
    ]
    this.frameIndexDrawing = 0
  }

  get frameDataDrawing() {
    return this.frames[this.frameIndexDrawing]
  }

  set frameDataDrawing(val) {
    this.frames[this.frameIndexDrawing] = val
  }
}

// History
let undos = []
let redos = []

function undo() {
  console.log('undo')
  if (undos.length) {
    redos.push(state)
    setState(undos.pop())
  }
}

function redo() {
  console.log('redo')
  if (redos.length) {
    undos.push(state)
    setState(redos.pop())
  }
}

function setState(partial = {}) {
  const isInit = state === partial

  const prevTool = state.tool
  const didToolChange = partial.tool && partial.tool !== state.prevTool

  state = new State({ ...state, ...partial })
  window.state = state

  if (didToolChange) {
    state.prevTool = prevTool
  }

  console.log('setState', state)

  // Order mostly matters here:
  // 1. storage MUST updated before UI can read from it
  // 2. UI SHOULD be rendered before canvas is drawn
  // 3. draw on canvas AFTER it is rendered
  if (!isInit) saveState(state)
  renderHTML(spriteEditor(state))
  drawImageToCanvas(state)
}

let state = loadState()

// ----------------------------------------
// Global Listeners
// ----------------------------------------
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
  // only allow keyboard shortcuts when not typing in an input
  if (e.target.tagName === 'INPUT') {
    return
  }

  switch (e.key) {
    case 'p':
      e.preventDefault()
      setState({ tool: DRAWING_TOOLS.pencil.key })
      break
    case 'e':
      e.preventDefault()
      setState({ tool: DRAWING_TOOLS.eraser.key })
      break
    case 'l':
      e.preventDefault()
      setState({ tool: DRAWING_TOOLS.line.key })
      break
    case 'g':
      e.preventDefault()
      setState({ showGrid: !state.showGrid })
      break
    case '=':
      if (!e.metaKey) {
        e.preventDefault()
        zoomIn(state)
      }
      break
    case '-':
      if (!e.metaKey) {
        e.preventDefault()
        zoomOut(state)
      }
      break
  }
})

// ----------------------------------------
// Start!
// ----------------------------------------
setState(state)

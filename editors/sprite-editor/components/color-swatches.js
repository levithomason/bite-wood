import { html } from '../../../node_modules/lit-html/lit-html.js'
import { classMap } from '../../../node_modules/lit-html/directives/class-map.js'

import DRAWING_TOOLS from '../config/drawing-tools.js'
import * as imageDataUtils from '../lib/image-data-utils.js'
import tinycolor from '../lib/tinycolor.js'
import { setState } from '../state-manager.js'

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

  const hues = 16
  const step = deg / hues

  const tints = 4
  const shades = 8
  const variants = tints + shades + 1

  const swatches = []

  // grayscale
  const gray = tinycolor('#fff')
  swatches.push(colorSwatch(state, gray.toRgb()))
  for (let i = 1; i < variants; i += 1) {
    gray.darken(100 / (variants - 1))
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
      dark.darken(100 / (shades * 2 + 3))
      row.push(colorSwatch(state, dark.toRgb()))
    }

    swatches.push(...row)
  }

  const rgbaInUseMap = new Map()
  state.frames.forEach(frame => {
    imageDataUtils.forEachPixel(frame, ([r, g, b, a255]) => {
      const a = a255 / 255
      const obj = { r, g, b, a }
      const key = `rgba(${r}, ${g}, ${b}, ${a255})`

      if (!rgbaInUseMap.has(key) && a255 > 0) {
        rgbaInUseMap.set(key, obj)
      }
    })
  })

  const swatchesInUse = [...rgbaInUseMap.values()]
    .sort((a, b) => {
      return tinycolor(a).toHsv().v > tinycolor(b).toHsv().v ? -1 : 1
    })
    .map(rgbaObj => {
      return colorSwatch(state, rgbaObj)
    })

  return html`
    <div class="color-swatches" style="--swatches-per-row: ${variants};">
      <div class="header">Used colors</div>
      <div class="used-colors">
        ${swatchesInUse.length ? swatchesInUse : '...'}
      </div>

      <div class="header">All colors</div>
      <div class="all-colors">${swatches}</div>
    </div>
  `
}

export default colorSwatches

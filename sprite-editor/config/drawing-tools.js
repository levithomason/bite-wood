import * as imageDataUtils from '../lib/image-data-utils.js'
import { setState } from '../state-manager.js'

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

  square: {
    key: 'square',
    icon: 'square',
    label: 'Square',
    draw(x2, y2, state) {
      const { startX, startY, startData } = DRAWING_TOOLS.square

      setState({
        frameDataDrawing: imageDataUtils.rectangle(
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
      console.log('START')
      DRAWING_TOOLS.square.startX = x
      DRAWING_TOOLS.square.startY = y
      DRAWING_TOOLS.square.startData = state.frameDataDrawing

      DRAWING_TOOLS.square.draw(x, y, state)
    },
    onMove: (x, y, state) => {
      DRAWING_TOOLS.square.draw(x, y, state)
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

export default DRAWING_TOOLS

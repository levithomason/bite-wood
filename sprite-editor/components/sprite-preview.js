import { html } from '../../node_modules/lit-html/lit-html.js'
import { styleMap } from '../../node_modules/lit-html/directives/style-map.js'
import * as imageDataUtils from '../lib/image-data-utils.js'
import { setState, getState } from '../state-manager.js'

let __previewLoopTimer
let __frameIndexPreview = 0

const drawPreviewCanvas = () => {
  const state = getState()
  const canvas = document.querySelector('.preview-canvas')
  const ctx = canvas.getContext('2d')
  const array = state.frames[__frameIndexPreview]

  if (array) {
    const imageData = new ImageData(array, state.width, state.height)
    ctx.putImageData(imageData, 0, 0)
  } else {
    ctx.clearRect(0, 0, state.width, state.height)
  }
}

const drawLoop = () => {
  // clear in case we've been called mid-cycle
  clearInterval(__previewLoopTimer)

  const state = getState()

  __previewLoopTimer = setTimeout(() => {
    __frameIndexPreview = (__frameIndexPreview + 1) % state.frames.length
    drawPreviewCanvas(state)
    drawLoop()
  }, 1000 / state.previewFPS)
}

// TODO: get rid of tick here, getState() is being called before init.  circular dep?
setTimeout(drawLoop)

// TODO - clear loop onwindow change
// clearInterval(__previewLoopTimer)

function spritePreview(state) {
  function handleSpeedChange(e) {
    setState({ previewFPS: Number(e.target.value) })
  }

  // function handlePlayClick() {
  //   setState({ isPreviewPlaying: !state.isPreviewPlaying })
  // }
  //       <button
  //         class="button frame play"
  //         @click=${handlePlayClick}
  //         ?disabled="${state.frames.length < 2}"
  //       >
  //         <i class="fas fa-${state.isPreviewPlaying ? 'pause' : 'play'}"></i>
  //       </button>

  return html`
    <div class="sprite-preview">
      <canvas
        class="preview-canvas"
        width="${state.width}"
        height="${state.height}"
        style="${styleMap({
          width: state.width * 4 + 'px',
          height: state.height * 4 + 'px',
        })}"
      ></canvas>
      <input
        class="speed-control"
        type="range"
        value="${state.previewFPS}"
        min="1"
        max="30"
        @input=${handleSpeedChange}
      />
    </div>
  `
}

export default spritePreview

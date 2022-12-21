import { html } from '../../../node_modules/lit-html/lit-html.js'
import actionTools from './action-tools.js'
import colorSwatches from './color-swatches.js'
import drawingTools from './drawing-tools.js'
import files from './files.js'
import frames from './frames.js'
import spriteHeader from './header.js'
import stage from './stage.js'

function editor(state) {
  return html`
    <div class="sprite-editor">
      ${spriteHeader(state)} ${drawingTools(state)} ${actionTools(state)}
      ${stage(state)} ${colorSwatches(state)} ${frames(state)} ${files(state)}
    </div>
  `
}

export default editor

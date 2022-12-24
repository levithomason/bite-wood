import { html } from '../../../node_modules/lit-html/lit-html.js'
import { classMap } from '../../../node_modules/lit-html/directives/class-map.js'

import DRAWING_TOOLS from '../config/drawing-tools.js'
import { setState } from '../state-manager.js'

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
      ${icon && html` <i class="fas fa-fw fa-${icon}"></i> `}
      ${label && html` <span class="label">${label}</span> `}
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
        ${drawingTool(state, {
          key: 'select',
          icon: 'expand',
          label: 'Select',
        })}
        ${drawingTool(state, {
          key: 'move',
          icon: 'arrows-alt',
          label: 'Move',
        })}
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
        ${drawingTool(state, DRAWING_TOOLS.square)}
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

export default drawingTools

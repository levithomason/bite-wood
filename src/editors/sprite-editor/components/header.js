import { html } from 'lit-html'
import { setState } from '../state-manager.js'

function spriteHeader(state) {
  const handleInput = (e) => {
    setState({ name: e.target.value })
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.target.blur()
    }
  }

  return html`
    <div class="sprite-editor-header">
      <div class="sprite-name">
        <i class="fas fa-image"></i>
        <input
          @input=${handleInput}
          @keydown=${handleKeyDown}
          value=${state.name}
          placeholder=${'Name your sprite...'}
        />
      </div>
    </div>
  `
}

export default spriteHeader

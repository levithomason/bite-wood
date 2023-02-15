import { html } from 'lit-html'
import { classMap } from 'lit-html/directives/class-map.js'
import { setState, State } from '../state-manager.js'
import storage, { loadState } from '../storage-manager.js'

function files(state) {
  const spriteStates = storage.values().map((json) => State.fromJSON(json))

  if (!spriteStates.length) {
    return null
  }

  const handleClick = (uid) => (e) => {
    if (state.uid !== uid) {
      setState(new State(loadState(uid)))
    }
  }

  function handleNewClick() {
    setState(new State())
  }

  return html`
    <div class="files">
      <h3 class="header">Sprites</h3>

      <button class="new-sprite file" @click=${handleNewClick}>
        <i class="fas fa-plus-circle"></i>
        <span class="label">New</span>
      </button>

      <!-- TODO: breakout file() component -->
      <!-- TODO: breakout file() component -->
      <!-- TODO: breakout file() component -->
      ${spriteStates.map((spriteState) => {
        const isActive = spriteState.uid === state.uid

        // TODO: make canvas component, we're drawing data inline a lot
        const canvas = document.createElement('canvas')
        canvas.width = spriteState.width
        canvas.height = spriteState.height

        const imageData = new ImageData(
          spriteState.frames[0],
          spriteState.width,
          spriteState.height,
        )

        const ctx = canvas.getContext('2d')
        ctx.putImageData(imageData, 0, 0)

        return html`
          <button
            @click=${handleClick(spriteState.uid)}
            class="file ${classMap({ active: isActive })}"
          >
            ${canvas}
            <label class="label">${spriteState.name || 'UNNAMED'}</label>
          </button>
        `
      })}
    </div>
  `
}

export default files

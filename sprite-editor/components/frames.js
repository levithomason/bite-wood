import { html } from '../../node_modules/lit-html/lit-html.js'
import { classMap } from '../../node_modules/lit-html/directives/class-map.js'

import { actions, setState } from '../state-manager.js'
import * as utils from '../../core/math.js'

function frames(state) {
  function handleAddFrameClick(e) {
    actions.addFrame(state)
  }

  function handleReverseClick(e) {
    actions.reverseFrames(state)
  }

  function handleDeleteAll() {
    actions.deleteAllFrames(state)
  }

  function handleDnD(eventname, element, event) {
    switch (eventname) {
      case 'start':
        this.dragged = element
        // no drag image
        // event.dataTransfer.setDragImage(new Image(0, 0), 0, 0)
        break
      case 'enter':
        if (this.dragged === element) {
          return false
        }
        const targetIndex = this.elements.indexOf(element)
        state.frames.splice(state.frames.indexOf(this.dragged), 1)
        state.frames = [
          ...state.frames.slice(0, targetIndex),
          this.dragged,
          ...state.frames.slice(targetIndex),
        ]
        setState({
          frames: null,
        })
        break
      case 'drop':
        event.stopPropagation()
        break
      case 'end':
        this.dragged = undefined
        break
    }
  }

  function handleDragStart(e) {
    console.log('handleDragStart', e)
    e.target.classList.add('dragging')
  }

  function handleDragOver(e) {
    console.log('handleDragOver', e)
    const canvases = document.querySelectorAll('.frames:not(.dragging) canvas')

    const closest = [...canvases].reduce(
      (acc, node) => {
        const rect = node.getBoundingClientRect()
        const distance = Math.abs(
          utils.distance(
            e.pageX,
            e.pageY,
            (rect.left + rect.right) / 2,
            (rect.top + rect.bottom) / 2,
          ),
        )

        node.style.boxShadow = ''

        return acc.distance < distance ? acc : { node, distance }
      },
      { node: null, distance: Infinity },
    )

    closest.node.style.boxShadow = 'inset 0 0 0 2px cornflowerblue'
  }

  function handleDragEnd(e) {
    console.log('handleDragEnd', e)
    e.target.classList.remove('dragging')

    document
      .querySelectorAll('.frames canvas:not(.dragging)')
      .forEach(node => (node.style.boxShadow = ''))
  }

  return html`
    <div class="frames">
      <button class="frame add-frame" @click=${handleAddFrameClick}>
        <i class="fas fa-plus-circle"></i>
      </button>
      <button class="frame reverse-frame" @click=${handleReverseClick}>
        <i class="fas fa-sort-amount-down fa-rotate-90"></i>
      </button>
      <button class="frame delete-all-frame" @click=${handleDeleteAll}>
        <i class="fas fa-trash-alt"></i>
      </button>

      <!-- TODO: break out frame() component -->
      <!-- TODO: break out frame() component -->
      <!-- TODO: break out frame() component -->
      ${state.frames.map((frameData, i) => {
        const canvas = document.createElement('canvas')
        canvas.width = state.width
        canvas.height = state.height

        const imageData = new ImageData(frameData, state.width, state.height)

        const ctx = canvas.getContext('2d')
        ctx.putImageData(imageData, 0, 0)

        const handleDeleteClick = e => {
          actions.deleteFrame(state, i)
        }

        const handleCopyClick = e => {
          const frames = [
            ...state.frames.slice(0, i + 1),
            ...state.frames.slice(i),
          ]
          console.log(frames)
          setState({
            frameIndexDrawing: i + 1,
            frames,
          })
        }

        return html`
          <button
            ?draggable="${state.frames.length > 1}"
            on-dragstart="${handleDragStart}"
            on-dragover="${handleDragOver}"
            on-dragend="${handleDragEnd}"
            @click="${e => {
              setState({ frameIndexDrawing: i })
            }}"
            class="frame ${classMap({
              active: i === state.frameIndexDrawing,
            })}"
          >
            ${canvas}
            <div class="index">${i}</div>
            <ul class="menu" @click="${e => e.stopPropagation()}">
              <li>
                <a @click="${handleCopyClick}">
                  <i class="fas fa-fw fa-copy"></i>
                  Copy
                </a>
              </li>
              ${state.frames.length > 1
                ? html`
                    <li>
                      <a @click="${handleDeleteClick}">
                        <i class="fas fa-fw fa-trash-alt"></i>
                        Delete
                      </a>
                    </li>
                  `
                : ''}
            </ul>
          </button>
        `
      })}
    </div>
  `
}

export default frames

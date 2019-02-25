import { html } from '../../node_modules/lit-html/lit-html.js'
import { classMap } from '../../node_modules/lit-html/directives/class-map.js'

import { actions, setState } from '../state-manager.js'
import * as utils from '../../core/math.js'

function HACK__playLoop() {
  window.HACK__playLoopTimer = setTimeout(() => {
    setState({
      frameIndexDrawing: (state.frameIndexDrawing + 1) % state.frames.length,
    })
    HACK__playLoop()
  }, 1000 / 10)
}

function frames(state) {
  function handleAddFrameClick(e) {
    actions.addFrame(state)
  }

  function handleReverseClick(e) {
    actions.reverseFrames(state)
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
      <button
        class="button frame play"
        @click=${handlePlayClick}
        ?disabled="${state.frames.length < 2}"
      >
        <i class="fas fa-${state.HACK__isPlaying ? 'pause' : 'play'}"></i>
      </button>

      <button class="button frame add-frame" @click=${handleAddFrameClick}>
        <i class="fas fa-plus-circle"></i>
      </button>
      <button class="button frame reverse-frame" @click=${handleReverseClick}>
        <i class="fas fa-exchange-alt"></i>
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
          if (confirm(`Are you sure you want to DELETE frame index ${i}?`)) {
            setState({
              frameIndexDrawing: Math.max(0, i - 1),
              frames: [
                ...state.frames.slice(0, i),
                ...state.frames.slice(i + 1),
              ],
            })
          }
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
            class="button frame ${classMap({
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

import DRAWING_TOOLS from './config/drawing-tools.js'
import { actions, getState, setState } from './state-manager.js'

document.addEventListener('keydown', (e) => {
  const state = getState()

  // only allow typing shortcuts when not typing in an input
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

    case 'z':
      if (e.metaKey) {
        e.preventDefault()

        if (e.shiftKey) {
          actions.redo(state)
        } else {
          actions.undo(state)
        }
      }
      break

    case '=':
      if (!e.metaKey) {
        e.preventDefault()
        actions.zoomIn(state)
      }
      break

    case '-':
      if (!e.metaKey) {
        e.preventDefault()
        actions.zoomOut(state)
      }
      break
  }
})

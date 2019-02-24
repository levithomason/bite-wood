import * as imageDataUtils from '../lib/image-data-utils.js'
import SETTINGS from './settings.js'
import { actions, setState } from '../state-manager.js'

const ACTION_TOOLS = {
  clear: state => ({
    key: 'clear',
    icon: 'times-circle',
    label: 'Clear',
    onClick: e => {
      if (confirm('Are you sure you want to CLEAR the image?')) {
        setState({
          frameDataDrawing: imageDataUtils.clear(state.frameDataDrawing),
        })
      }
    },
  }),

  grid: state => ({
    key: 'grid',
    icon: 'th',
    label: 'Grid',
    active: state.showGrid,
    onClick: e => {
      setState({ showGrid: !state.showGrid })
    },
  }),

  undo: state => ({
    key: 'undo',
    icon: 'undo',
    badge: state.undos.length,
    disabled: state.undos.length < 1,
    onClick: e => {
      actions.undo(state)
    },
  }),

  redo: state => ({
    key: 'redo',
    icon: 'redo',
    badge: state.redos.length,
    disabled: state.redos.length < 1,
    onClick: e => {
      actions.redo(state)
    },
  }),

  zoomIn: state => ({
    key: 'zoomIn',
    icon: 'search-plus',
    disabled: state.scale >= SETTINGS.MAX_ZOOM,
    onClick: e => {
      actions.zoomIn(state)
    },
  }),

  zoomOut: state => ({
    key: 'zoomOut',
    icon: 'search-minus',
    disabled: state.scale <= SETTINGS.MIN_ZOOM,
    onClick: e => {
      actions.zoomOut(state)
    },
  }),
}

export default ACTION_TOOLS

import * as imageDataUtils from '../lib/image-data-utils.js'
import { loadState } from '../storage-manager.js'
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

  export: state => ({
    key: 'export',
    icon: 'file-export',
    label: 'Export',
    onClick: e => {
      const filename = `${state.name}.json`
      const contentType = 'application/json;charset=utf-8;'
      const uriComponent = encodeURIComponent(
        JSON.stringify(loadState(state.uid)),
      )

      const a = document.createElement('a')
      a.download = filename
      a.href = `data:${contentType},${uriComponent}`
      a.target = '_blank'

      document.body.appendChild(a)

      a.click()

      document.body.removeChild(a)
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

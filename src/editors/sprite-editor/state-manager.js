import { render } from 'lit-html'

import editor from './components/editor.js'
import DRAWING_TOOLS from './config/drawing-tools.js'
import SETTINGS from './config/settings.js'
import * as imageDataUtils from './lib/image-data-utils.js'
import storage, { BUCKETS, KEYS, saveState } from './storage-manager.js'

let state = {}

// ----------------------------------------
// State
// ----------------------------------------

export class State {
  static toJSON(state) {
    return {
      uid: state.uid,
      name: state.name,
      width: state.width,
      height: state.height,
      frames: state.frames.map((frame) => new Array(...frame)),
    }
  }

  static fromJSON = (json) => {
    return {
      ...json,
      frames:
        json.frames?.map((frame) => imageDataUtils.arrayFrom(frame)) ?? [],
    }
  }

  constructor(json) {
    this.uid = Date.now().toString(36)
    this.name = ''
    this.prevTool = ''
    this.tool = DRAWING_TOOLS.pencil.key
    this.color = [0, 0, 0, 255]
    this.scale = 16
    this.showGrid = false
    this.width = SETTINGS.DEFAULT_WIDTH
    this.height = SETTINGS.DEFAULT_HEIGHT
    this.frameIndexDrawing = 0
    this.frames = [
      imageDataUtils.arrayFrom(
        SETTINGS.DEFAULT_HEIGHT * SETTINGS.DEFAULT_WIDTH * 4,
      ),
    ]
    this.undos = []
    this.redos = []
    this.previewFPS = 10

    if (json) {
      Object.assign(this, State.fromJSON(json))
    }
  }

  get frameDataDrawing() {
    return this.frames[this.frameIndexDrawing]
  }

  set frameDataDrawing(val) {
    this.frames[this.frameIndexDrawing] = val
  }
}

// ----------------------------------------
// Private
// ----------------------------------------
const renderApp = (state) => {
  if (!renderApp.mountNode) {
    renderApp.mountNode = document.createElement('div')
    renderApp.mountNode.id = 'root'
    document.body.appendChild(renderApp.mountNode)
  }

  render(editor(state), renderApp.mountNode)
}

const drawDrawingCanvas = (state) => {
  const canvas = document.querySelector('.drawing-canvas')
  const ctx = canvas.getContext('2d')
  const imageData = new ImageData(
    state.frameDataDrawing,
    state.width,
    state.height,
  )
  ctx.putImageData(imageData, 0, 0)
}

const getUndoRedoRecord = (state) => {
  const { width, height, frames } = new State(state)
  return { width, height, frames }
}

// ----------------------------------------
// Public
// ----------------------------------------

export function setState(partial = {}) {
  const isInit = state === partial

  const prevTool = state.tool
  const didToolChange = partial.tool && partial.tool !== state.prevTool

  const nextState = new State({ ...state, ...partial })

  if (didToolChange) {
    nextState.prevTool = prevTool
  }

  // keep a record of the last active state UID so we can load it on refresh
  // TODO: implement createdAt, editedAt and sort by editedAt...
  const originalBucket = storage.getBucket()
  storage.setBucket(BUCKETS.SPRITE_EDITOR)
  storage.set(KEYS.LAST_ACTIVE_UID, nextState.uid)
  storage.setBucket(originalBucket)

  // when changing sprites, we want to clear undo/redo history
  if (state.uid !== nextState.uid) {
    state.undos = []
    state.redos = []
  }

  console.debug('setState', nextState)
  state = nextState
  window.state = state

  // Order mostly matters here:
  // 1. storage MUST be updated before UI can read from it
  // 2. UI SHOULD be rendered before canvas is drawn
  // 3. draw on canvas AFTER the canvas is rendered
  if (!isInit) saveState(State.toJSON(nextState))
  renderApp(nextState)
  drawDrawingCanvas(nextState)
}

// ----------------------------------------
// Actions
// ----------------------------------------

export const actions = {}

//
// Actions: Sprite
//

actions.addFrame = (state) => {
  setState({
    frames: [
      ...state.frames,
      imageDataUtils.arrayFrom(state.height * state.width * 4),
    ],
    frameIndexDrawing: state.frames.length,
  })
}

actions.reverseFrames = (state) => {
  setState({
    frames: state.frames.reverse(),
  })
}

actions.deleteFrame = (state, index) => {
  if (confirm(`DELETE frame index ${index}?`)) {
    setState({
      frameIndexDrawing: Math.max(0, index - 1),
      frames: [
        ...state.frames.slice(0, index),
        ...state.frames.slice(index + 1),
      ],
    })
  }
}

actions.deleteAllFrames = (state, index) => {
  if (confirm(`DELETE ALL frames?`)) {
    setState({
      frameIndexDrawing: 0,
      frames: [imageDataUtils.arrayFrom(state.height * state.width * 4)],
    })
  }
}

//
// Actions: Editor
//

actions.addUndo = (state) => {
  setState({
    undos: [getUndoRedoRecord(state), ...state.undos].slice(
      0,
      SETTINGS.MAX_UNDOS,
    ),
  })
  console.log('addUndo', getState().undos)
}

actions.addUndoIfNeeded = (prevState, state) => {
  console.log('addUndoIfNeeded')

  // definitely no undo necessary
  if (state === prevState) {
    console.log('  ...NO, states referentially equal')
    return
  }

  // changes that would require an undo record

  const didDimensionsChange =
    state.width !== prevState.width || state.height !== prevState.height

  if (didDimensionsChange) {
    console.log('  ...YES, dimensions changed')
    actions.addUndo(prevState)
    return
  }

  const didFrameCountChange = state.frames.length !== prevState.frames.length

  if (didFrameCountChange) {
    console.log('  ...YES, frame count changed')
    actions.addUndo(prevState)
    return
  }

  const didFrameContentChange = state.frames.some((frame, frameIdx) => {
    return frame.some((rgbaValue, rgbaIdx) => {
      return rgbaValue !== prevState.frames[frameIdx][rgbaIdx]
    })
  })

  if (didFrameContentChange) {
    console.log('  ...YES, frame content changed')
    actions.addUndo(prevState)
    return
  }

  console.log('  ...NO, no pertinent changes')
}

actions.addRedo = (state) => {
  setState({
    redos: [getUndoRedoRecord(state), ...state.redos],
  })
  console.log('addRedo', getState().redos)
}

actions.undo = (state) => {
  console.group('undo')
  console.log({ undos: state.undos, redos: state.redos })
  const undoState = state.undos.shift()

  if (undoState) {
    setState({
      redos: [getUndoRedoRecord(state), ...state.redos],
      ...undoState,
    })
  }
  const newState = getState()
  console.log({ undos: newState.undos, redos: newState.redos })
  console.groupEnd()
}

actions.redo = (state) => {
  console.group('redo')
  console.log({ undos: state.undos, redos: state.redos })
  const redoState = state.redos.shift()

  if (redoState) {
    setState({
      undos: [getUndoRedoRecord(state), ...state.undos],
      ...redoState,
    })
  }
  const newState = getState()
  console.log({ undos: newState.undos, redos: newState.redos })
  console.groupEnd()
}

actions.zoomIn = (state) => {
  setState({ scale: Math.min(SETTINGS.MAX_ZOOM, state.scale * 1.5) })
}

actions.zoomOut = (state) => {
  setState({
    scale: Math.max(SETTINGS.MIN_ZOOM, Math.round(state.scale / 1.5)),
  })
}

// ----------------------------------------
// API
// ----------------------------------------
export const getState = () => new State(state)

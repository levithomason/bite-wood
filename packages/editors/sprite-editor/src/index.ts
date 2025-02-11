import { setState, State } from './state-manager.js'
import { loadState } from './storage-manager.js'
import './keyboard-manager.js'

// ----------------------------------------
// Render
// ----------------------------------------

setState(new State(loadState()))

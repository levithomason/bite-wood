import { gameLoop } from './core/game/index.js'
import room0 from './rooms/room0.js'
import room1 from './rooms/room1.js'
import * as draw from './core/draw.js'
import state from './core/state.js'

// ----------------------------------------
// GAME
// ----------------------------------------
state.addRoom(room0)
state.addRoom(room1)

draw.init()
gameLoop.start()

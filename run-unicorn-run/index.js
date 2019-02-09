import { Game, GameImage } from './core/game/index.js'

import * as draw from './core/draw.js'
import physics from './core/physics.js'
import state, { addObject } from './core/state.js'

import objPlayer from './objects/player.js'
import objRainbowDash from './objects/rainbow-dash.js'
// import objSolid from './objects/solid.js'

// ----------------------------------------
// GAME
// ----------------------------------------
const game = new Game()
game.setBackgroundImage(new GameImage('./images/background.png'))

// addObject(objSolid)
addObject(objRainbowDash)
addObject(objPlayer)

game.start()

window.game = game
window.objPlayer = objPlayer
window.objRainbowDash = objRainbowDash
// window.objSolid = objSolid
window.draw = draw
window.state = state
window.physics = physics

// ----------------------------------------
// AUDIO
// ----------------------------------------
// const sndBackground = new Audio(
//   'http://soundimage.org/wp-content/uploads/2017/05/Hypnotic-Puzzle.mp3',
// )
// sndBackground.loop = true
// sndBackground.volume = 0.3
// sndBackground.play()

import { Game, GameImage } from './game/index.js'

import * as draw from './draw.js'
import physics from './physics.js'
import state, { addObject } from './state.js'

import objPlayer from './player.js'
import objRainbowDash from './rainbow-dash.js'
import objSolid from './solid.js'

// ----------------------------------------
// GAME
// ----------------------------------------
const game = new Game()
game.setBackgroundImage(new GameImage('./background.png'))

addObject(objSolid)
addObject(objRainbowDash)
addObject(objPlayer)

game.start()

window.game = game
window.objPlayer = objPlayer
window.objRainbowDash = objRainbowDash
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

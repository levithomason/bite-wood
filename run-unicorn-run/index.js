import { Game, GameImage } from './game.js'
import objPlayer from './player.js'
import objRainbowDash from './rainbow-dash.js'
import objSolid from './solid.js'
import * as draw from './draw.js'
import physics from './physics.js'

const imgBackground = new GameImage('./background.png')

// ----------------------------------------
// GAME
// ----------------------------------------
const game = new Game()
game.setBackgroundImage(imgBackground)
game.addObject(objPlayer)
game.addObject(objRainbowDash)
game.addObject(objSolid)
game.start()

window.game = game
window.objPlayer = objPlayer
window.objRainbowDash = objRainbowDash
window.draw = draw
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

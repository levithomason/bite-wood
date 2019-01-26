import { Game, GameImage } from './game.js'
import objPlayer from './player.js'
import objRainbowDash from './rainbow-dash.js'

const imgBackground = new GameImage('./background.png')

// ----------------------------------------
// GAME
// ----------------------------------------
const game = new Game()
game.setBackgroundImage(imgBackground.image)
game.addObject(objPlayer)
game.addObject(objRainbowDash)
game.start()

window.game = game

// ----------------------------------------
// AUDIO
// ----------------------------------------
const sndBackground = new Audio(
  'http://soundimage.org/wp-content/uploads/2017/05/Hypnotic-Puzzle.mp3',
)
sndBackground.loop = true
sndBackground.volume = 0.3
sndBackground.play()

import { Game, GameImage } from './../core/game/index.js'

import { setRoom } from './../core/state.js'

import objPlayer from './../objects/player.js'
import objRainbowDash from './../objects/rainbow-dash.js'
import objSolid from './../objects/solid.js'

// ----------------------------------------
// GAME
// ----------------------------------------
const game = new Game()
game.setBackgroundImage(new GameImage('./../images/background.png'))

setRoom({
  objects: [
    objSolid,
    objRainbowDash,
    objPlayer,
  ]
})

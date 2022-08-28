import { Game, GameDrawing } from '../core/game/index.js'
import room0 from './rooms/room0.js'
import room1 from './rooms/room1.js'
import state from '../core/state.js'

// ----------------------------------------
// Game
// ----------------------------------------

const startButton = document.getElementById('start-button')
startButton.addEventListener('click', start)

function start() {
  startButton.parentElement.removeChild(startButton)

  // state
  state.addRoom(room0)
  state.addRoom(room1)

  // drawing
  const drawing = new GameDrawing(state.room.width, state.room.height)
  document.body.append(drawing.canvas)

  // game
  const game = new Game(state, drawing)
  game.start()
}

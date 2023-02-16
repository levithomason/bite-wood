import { Game, gameRooms } from '../../core/index.js'

import Room0 from './rooms/room0.js'
import Room1 from './rooms/room1.js'

// ----------------------------------------
// Game
// ----------------------------------------

// game
const game = new Game()

gameRooms.addRoom(new Room0())
gameRooms.addRoom(new Room1())

// gameState.debug = true
game.start()

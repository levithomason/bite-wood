import { Game, gameRooms } from '../../core/index.js'
import { room0 } from './rooms/room0.js'

gameRooms.addRoom(room0)
// gameState.debug = true

// =============================================================================
// Game
// =============================================================================

const game = new Game()
game.start()

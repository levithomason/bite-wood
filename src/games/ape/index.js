import { Game, gameRooms } from '../../core/index.js'
import { room0 } from './rooms/room0.js'

// TODO: gameRooms.addRoom() should take the GameRoom class so we don't need to
//       pre-create all rooms. Defer creation until the room is needed.
//       Will need strategy to persist rooms (keep state) while not active.
gameRooms.addRoom(room0)
// gameState.debug = true

// =============================================================================
// Game
// =============================================================================

const game = new Game()
game.start()

import { Game } from '../../core/game.js'
import { gameKeyboard, GameRoom, gameRooms } from '../../core/index.js'

class Room extends GameRoom {
  constructor() {
    super(800, 600)

    this.draw = this.draw.bind(this)
  }
  draw(drawing) {
    super.draw(drawing)

    JSON.stringify(gameKeyboard, null, 2)
      .split('\n')
      .forEach((line, i) => {
        drawing.text(line, 100, 100 + i * 18)
      })
  }
}

gameRooms.addRoom(new Room())

const game = new Game()
game.start()

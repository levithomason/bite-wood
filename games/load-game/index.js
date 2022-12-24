import { Game, GameRoom, gameRooms } from '../../core/index.js'

// TODO: add game file based on toJSON/fromJSON methods in objects
//       1) it should contain all config required to instantiate the game (objects, rooms, etc)
//       2) bootstrap a game using the config file
// const gameFile = {
//   name: 'My Game',
//   objects: [
//     { name: 'Square', x: 100, y: 400 },
//     { name: 'Circle', x: 200, y: 200 },
//     { name: 'Rectangle', x: 300, y: 300 },
//   ],
// }

class Room extends GameRoom {
  constructor() {
    super(800, 600)

    this.backgroundColor = 'black'
  }
  draw(drawing) {
    super.draw(drawing)

    drawing
      .setFillColor('white')
      .setFontSize(21)
      .textAlign('center')
      .text(
        'TODO: this will load a game from JSON',
        this.width / 2,
        this.height / 2,
      )
  }
}

const room = new Room(800, 600)
gameRooms.addRoom(room)

const game = new Game()
game.start()

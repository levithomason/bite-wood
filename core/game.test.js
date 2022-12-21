import { Game } from './game.js'
import { GameObject } from './game-object.js'
import { GameRoom } from './game-room.js'
import { gameRooms } from './game-rooms.js'

describe('Game', () => {
  it('can instantiate with no options', () => {
    expect(() => new Game()).not.toThrow()
  })

  describe('start', () => {
    beforeEach(() => {
      gameState.play()
      gameRooms.clearRooms()
    })

    it('begins calling step on all room objects', () => {
      const game = new Game()
      class Room extends GameRoom {}

      const room = new Room(800, 600)
      room.instanceCreate(GameObject)
      room.instanceCreate(GameObject)
      room.instanceCreate(GameObject)

      jest.spyOn(room.objects[0], 'step')
      jest.spyOn(room.objects[1], 'step')
      jest.spyOn(room.objects[2], 'step')

      gameRooms.addRoom(room)
      game.start()
      game.stop()

      expect(room.objects[0].step).toBeCalledTimes(1)
      expect(room.objects[1].step).toBeCalledTimes(1)
      expect(room.objects[2].step).toBeCalledTimes(1)
    })

    it('does not call object step if gameState is paused ', async () => {
      const game = new Game()

      class Room extends GameRoom {}
      const room = new Room(800, 600)
      room.instanceCreate(GameObject)

      jest.spyOn(room.objects[0], 'step')

      gameState.pause()
      gameRooms.addRoom(room)
      game.start()
      game.stop()

      await Promise.resolve()

      expect(room.objects[0].step).not.toBeCalled()
    })
  })
})

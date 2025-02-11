import { beforeEach, describe, expect, it, test } from 'vitest'

import { Game, gameRooms, gameState } from '../src/index.js'

describe('Game', () => {
  it('can instantiate with no options', () => {
    expect(() => new Game()).not.toThrow()
  })

  describe('start', () => {
    beforeEach(() => {
      gameState.play()
      gameRooms.clearRooms()
    })

    it.todo(
      'begins calling step on all room objects',
      // () => {
      //   const game = new Game()
      //   class Room extends GameRoom {}
      //
      //   const room = new Room(800, 600)
      //   room.instanceCreate(GameObject)
      //   room.instanceCreate(GameObject)
      //   room.instanceCreate(GameObject)
      //
      //   jest.spyOn(room.objects[0], 'step')
      //   jest.spyOn(room.objects[1], 'step')
      //   jest.spyOn(room.objects[2], 'step')
      //
      //   gameRooms.addRoom(room)
      //   // TODO: There is no guarantee that the game loop will run at least once
      //   //       as it waits for enough time to pass to achieve the desired FPS.
      //   //       Move test to an async test and wait for the game loop to call step.
      //   game.start()
      //   game.stop()
      //
      //   expect(room.objects[0].step).toBeCalledTimes(1)
      //   expect(room.objects[1].step).toBeCalledTimes(1)
      //   expect(room.objects[2].step).toBeCalledTimes(1)
      // }
    )

    test.todo(
      'does not call object step if gameState is paused ',
      // () => {
      //   const game = new Game()
      //
      //   class Room extends GameRoom {}
      //   const room = new Room(800, 600)
      //   room.instanceCreate(GameObject)
      //
      //   jest.spyOn(room.objects[0], 'step')
      //
      //   // TODO: gameState.pause() doesn't have an effect on the game loop here
      //   gameState.pause()
      //   gameRooms.addRoom(room)
      //   game.start()
      //   game.stop()
      //
      //   expect(room.objects[0].step).not.toBeCalled()
      // }
    )
  })
})

import { describe, expect, it } from 'vitest'
import { direction } from '../src/math.js'
import { GamePhysics } from '../src/index.js'

describe('GamePhysics', () => {
  describe('directions', () => {
    it('should point in the correct direction', () => {
      const gamePhysics = new GamePhysics()
      const right = direction(0, 0, 1, 0)
      const left = direction(0, 0, -1, 0)
      const up = direction(0, 0, 0, -1)
      const down = direction(0, 0, 0, 1)
      expect(gamePhysics.DIRECTION_RIGHT).toEqual(right)
      expect(gamePhysics.DIRECTION_LEFT).toEqual(left)
      expect(gamePhysics.DIRECTION_UP).toEqual(up)
      expect(gamePhysics.DIRECTION_DOWN).toEqual(down)
    })
  })
})

import { describe, expect, it } from 'vitest'

import { direction } from '../src/math.js'

describe('math', () => {
  describe('direction', () => {
    it('should return values between 0 and 360', () => {
      expect(direction(0, 0, 1, 0)).toEqual(0) // right
      expect(direction(0, 0, 0, 1)).toEqual(90) // down
      expect(direction(0, 0, -1, 0)).toEqual(180) // left
      expect(direction(0, 0, 0, -1)).toEqual(270) // up
    })
  })
})

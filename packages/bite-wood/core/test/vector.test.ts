import { describe, expect, it } from 'vitest'

import { Vector } from '../src/vector.js'

describe('vector', () => {
  describe('direction', () => {
    it('should return the direction of the vector in degrees', () => {
      const right = new Vector(1, 0)
      const down = new Vector(0, 1)
      const left = new Vector(-1, 0)
      const up = new Vector(0, -1)

      expect(right.direction).toEqual(0)
      expect(down.direction).toEqual(90)
      expect(left.direction).toEqual(180)
      expect(up.direction).toEqual(270)
    })

    it('should not change the magnitude when set', () => {
      const vector = new Vector(3, 4)
      expect(vector.magnitude).toEqual(5)

      // TODO: this should be handled lower level for all math ops.
      // JavaScript produces inaccurate floating point numbers
      // We can end up with a magnitude of 5.000000000000001
      // This is plenty accurate for our purposes
      const numDigits = 14

      vector.direction = 0
      expect(vector.magnitude).toBeCloseTo(5, numDigits)
      vector.direction = 45
      expect(vector.magnitude).toBeCloseTo(5, numDigits)
      vector.direction = 90
      expect(vector.magnitude).toBeCloseTo(5, numDigits)
      vector.direction = 135
      expect(vector.magnitude).toBeCloseTo(5, numDigits)
      vector.direction = 180
      expect(vector.magnitude).toBeCloseTo(5, numDigits)
      vector.direction = 225
      expect(vector.magnitude).toBeCloseTo(5, numDigits)
      vector.direction = 270
      expect(vector.magnitude).toBeCloseTo(5, numDigits)
      vector.direction = 360
      expect(vector.magnitude).toBeCloseTo(5, numDigits)
    })
  })

  describe('magnitude', () => {
    it('should return the magnitude of the vector', () => {
      expect(new Vector(3, 4).magnitude).toEqual(5)
    })

    it('should return positive numbers for negative coordinates', () => {
      expect(new Vector(3, -4).magnitude).toEqual(5)
      expect(new Vector(-3, 4).magnitude).toEqual(5)
      expect(new Vector(-3, -4).magnitude).toEqual(5)
    })

    it('should not change the direction when set', () => {
      const direction = 45
      const vector = new Vector(1, 1)
      expect(vector.direction).toEqual(direction)

      vector.magnitude = 10000000
      expect(vector.direction).toEqual(direction)
      vector.magnitude = 0.00000001
      expect(vector.direction).toEqual(direction)
      vector.magnitude = 1
      expect(vector.direction).toEqual(direction)
    })
  })
})

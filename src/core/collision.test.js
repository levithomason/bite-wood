import { collisionRectangleRectangle } from './collision.js'

describe('collision', () => {
  describe('collisionRectangleRectangle', () => {
    describe('sides on one another', () => {
      it('left side is on the right side', () => {
        const r1 = [0, 0, 10, 10]
        const r2 = [10, 0, 20, 10]
        const hasCollision = collisionRectangleRectangle(...r1, ...r2)
        expect(hasCollision).toBe(true)
      })

      it('right side is on the left side', () => {
        const r1 = [10, 0, 20, 10]
        const r2 = [0, 0, 10, 10]
        const hasCollision = collisionRectangleRectangle(...r1, ...r2)
        expect(hasCollision).toBe(true)
      })

      it('top side is on the bottom side', () => {
        const r1 = [0, 0, 10, 10]
        const r2 = [0, 10, 10, 20]
        const hasCollision = collisionRectangleRectangle(...r1, ...r2)
        expect(hasCollision).toBe(true)
      })

      it('bottom side is on the top side', () => {
        const r1 = [0, 10, 10, 20]
        const r2 = [0, 0, 10, 10]
        const hasCollision = collisionRectangleRectangle(...r1, ...r2)
        expect(hasCollision).toBe(true)
      })
    })

    describe('overlapping sides', () => {
      it('left side is overlapping the right side', () => {
        const r1 = [0, 0, 10, 10]
        const r2 = [9, 0, 20, 10]
        const hasCollision = collisionRectangleRectangle(...r1, ...r2)
        expect(hasCollision).toBe(true)
      })

      it('right side is overlapping the left side', () => {
        const r1 = [9, 0, 20, 10]
        const r2 = [0, 0, 10, 10]
        const hasCollision = collisionRectangleRectangle(...r1, ...r2)
        expect(hasCollision).toBe(true)
      })

      it('top side is overlapping the bottom side', () => {
        const r1 = [0, 0, 10, 10]
        const r2 = [0, 9, 10, 20]
        const hasCollision = collisionRectangleRectangle(...r1, ...r2)
        expect(hasCollision).toBe(true)
      })

      it('bottom side is overlapping the top side', () => {
        const r1 = [0, 9, 10, 20]
        const r2 = [0, 0, 10, 10]
        const hasCollision = collisionRectangleRectangle(...r1, ...r2)
        expect(hasCollision).toBe(true)
      })
    })

    describe('overlapping corners', () => {
      it('top left corner is overlapping the bottom right corner', () => {
        const r1 = [0, 0, 10, 10]
        const r2 = [9, 9, 20, 20]
        const hasCollision = collisionRectangleRectangle(...r1, ...r2)
        expect(hasCollision).toBe(true)
      })

      it('top right corner is overlapping the bottom left corner', () => {
        const r1 = [9, 0, 20, 10]
        const r2 = [0, 9, 10, 20]
        const hasCollision = collisionRectangleRectangle(...r1, ...r2)
        expect(hasCollision).toBe(true)
      })

      it('bottom left corner is overlapping the top right corner', () => {
        const r1 = [0, 9, 10, 20]
        const r2 = [9, 0, 20, 10]
        const hasCollision = collisionRectangleRectangle(...r1, ...r2)
        expect(hasCollision).toBe(true)
      })
    })

    describe('containing each other', () => {
      it('first rectangle contains the second', () => {
        const r1 = [0, 0, 10, 10]
        const r2 = [1, 1, 9, 9]
        const hasCollision = collisionRectangleRectangle(...r1, ...r2)
        expect(hasCollision).toBe(true)
      })

      it('second rectangle contains the first', () => {
        const r1 = [1, 1, 9, 9]
        const r2 = [0, 0, 10, 10]
        const hasCollision = collisionRectangleRectangle(...r1, ...r2)
        expect(hasCollision).toBe(true)
      })
    })

    describe('extending through one another', () => {
      it('rectangle extends horizontally through the other', () => {
        const r1 = [10, 10, 20, 20]
        const r2 = [5, 14, 25, 16]
        const hasCollision = collisionRectangleRectangle(...r1, ...r2)
        expect(hasCollision).toBe(true)
      })

      it('rectangle extends vertically through the other', () => {
        const r1 = [10, 10, 20, 20]
        const r2 = [14, 5, 16, 25]
        const hasCollision = collisionRectangleRectangle(...r1, ...r2)
        expect(hasCollision).toBe(true)
      })

      it('bottom right corner is overlapping the top left corner', () => {
        const r1 = [9, 9, 20, 20]
        const r2 = [0, 0, 10, 10]
        const hasCollision = collisionRectangleRectangle(...r1, ...r2)
        expect(hasCollision).toBe(true)
      })
    })

    describe('no collision', () => {
      it('returns false if the left side is to the right of the right side', () => {
        const r1 = [0, 0, 10, 10]
        const r2 = [11, 0, 20, 10]
        const hasCollision = collisionRectangleRectangle(...r1, ...r2)
        expect(hasCollision).toBe(false)
      })

      it('returns false if the right side is to the left of the left side', () => {
        const r1 = [11, 0, 20, 10]
        const r2 = [0, 0, 10, 10]
        const hasCollision = collisionRectangleRectangle(...r1, ...r2)
        expect(hasCollision).toBe(false)
      })

      it('returns false if the top side is below the bottom side', () => {
        const r1 = [0, 0, 10, 10]
        const r2 = [0, 11, 10, 20]
        const hasCollision = collisionRectangleRectangle(...r1, ...r2)
        expect(hasCollision).toBe(false)
      })

      it('returns false if the bottom side is above the top side', () => {
        const r1 = [0, 11, 10, 20]
        const r2 = [0, 0, 10, 10]
        const hasCollision = collisionRectangleRectangle(...r1, ...r2)
        expect(hasCollision).toBe(false)
      })
    })
  })
})

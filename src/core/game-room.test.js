import { GameRoom } from './game-room.js'

describe('GameRoom', () => {
  describe('randomXPosition', () => {
    it('returns values inside the room width', () => {
      const width = 100
      const room = new GameRoom({ width, height: 100 })

      for (let i = 0; i < 100; i += 1) {
        const x = room.randomXPosition()
        expect(x).toBeGreaterThanOrEqual(0)
        expect(x).toBeLessThanOrEqual(width)
      }
    })

    it('does not return values inside the padding pixels', () => {
      const width = 100
      const room = new GameRoom({ width, height: 100 })

      const paddingLeft = 25
      const paddingRight = 25

      for (let i = 0; i < 100; i += 1) {
        const y = room.randomXPosition(paddingLeft, paddingRight)
        expect(y).toBeGreaterThanOrEqual(paddingLeft)
        expect(y).toBeLessThanOrEqual(width - paddingRight)
      }
    })

    it('does not return values inside the padding percentage', () => {
      const width = 100
      const room = new GameRoom({ width, height: 100 })

      const paddingLeft = 0.25
      const paddingRight = 0.25

      for (let i = 0; i < 100; i += 1) {
        const y = room.randomXPosition(paddingLeft, paddingRight)
        expect(y).toBeGreaterThanOrEqual(paddingLeft)
        expect(y).toBeLessThanOrEqual(width * (1 - paddingRight))
      }
    })
  })

  describe('randomYPosition', () => {
    it('returns values inside the room height', () => {
      const height = 100
      const room = new GameRoom({ width: 100, height })

      for (let i = 0; i < 100; i += 1) {
        const y = room.randomYPosition()
        expect(y).toBeGreaterThanOrEqual(0)
        expect(y).toBeLessThanOrEqual(height)
      }
    })

    it('does not return values inside the padding pixels', () => {
      const height = 100
      const room = new GameRoom({ width: 100, height })

      const paddingTop = 25
      const paddingBottom = 25

      for (let i = 0; i < 100; i += 1) {
        const y = room.randomYPosition(paddingTop, paddingBottom)
        expect(y).toBeGreaterThanOrEqual(paddingTop)
        expect(y).toBeLessThanOrEqual(height - paddingBottom)
      }
    })

    it('does not return values inside the padding percentage', () => {
      const height = 100
      const room = new GameRoom({ width: 100, height })

      const paddingTop = 0.25
      const paddingBottom = 0.25

      for (let i = 0; i < 100; i += 1) {
        const y = room.randomYPosition(paddingTop, paddingBottom)
        expect(y).toBeGreaterThanOrEqual(paddingTop)
        expect(y).toBeLessThanOrEqual(height * (1 - paddingBottom))
      }
    })
  })
})

import { beforeEach, describe, expect, it } from 'vitest'
import { GameImage, GameSprite, GameSpriteConfig } from '../src/index.js'

const makeSprite = (config: Partial<GameSpriteConfig> = {}): GameSprite => {
  return new GameSprite(new GameImage('no.png'), {
    frameWidth: 10,
    frameHeight: 20,
    ...config,
  })
}

describe('GameSprite', () => {
  /** @type GameSprite */
  let sprite

  beforeEach(() => {
    sprite = makeSprite()
  })

  describe('width', () => {
    it('returns the frameWidth when scaleX is not set', () => {
      sprite = makeSprite({ frameWidth: 10 })
      expect(sprite.width).toEqual(sprite.frameWidth)
    })

    it('returns the frameWidth when scaleX = 1', () => {
      sprite = makeSprite({ frameWidth: 10, scaleX: 1 })
      expect(sprite.width).toEqual(sprite.frameWidth)
    })

    it('returns the scaled frameWidth when scaleX is set', () => {
      sprite = makeSprite({ frameWidth: 10, scaleX: 2 })
      expect(sprite.width).toEqual(20)

      sprite = makeSprite({ frameWidth: 10, scaleX: 3 })
      expect(sprite.width).toEqual(30)

      sprite = makeSprite({ frameWidth: 8, scaleX: 7 })
      expect(sprite.width).toEqual(56)
    })
  })

  describe('height', () => {
    it('returns the frameHeight when scaleY is not set', () => {
      sprite = makeSprite({ frameHeight: 10 })
      expect(sprite.height).toEqual(sprite.frameHeight)
    })

    it('returns the frameHeight when scaleY = 1', () => {
      sprite = makeSprite({ frameHeight: 10, scaleY: 1 })
      expect(sprite.height).toEqual(sprite.frameHeight)
    })

    it('returns the scaled frameHeight when scaleY is set', () => {
      sprite = makeSprite({ frameHeight: 10, scaleY: 2 })
      expect(sprite.height).toEqual(20)

      sprite = makeSprite({ frameHeight: 10, scaleY: 3 })
      expect(sprite.height).toEqual(30)

      sprite = makeSprite({ frameHeight: 8, scaleY: 7 })
      expect(sprite.height).toEqual(56)
    })
  })
})

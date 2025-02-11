import { describe, expect, it } from 'vitest'
import { GameImage } from '../src/index.js'

describe('GameImage', () => {
  it('should initialize with PENDING state', () => {
    const img = new GameImage('no.png')
    expect(img.loaded).toBe(false)
  })

  it('should load image successfully', async () => {
    const onePixel =
      'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw=='
    const img = new GameImage(onePixel)
    await expect(img.load()).resolves.toBeTruthy()

    expect(img.loaded).toBe(true)
    expect(img.width).toBe(img.element.naturalWidth)
    expect(img.height).toBe(img.element.naturalHeight)
  })

  it('should handle image load failure', async () => {
    const img = new GameImage('no.png')
    await expect(img.load()).rejects.toThrow()
    expect(img.loaded).toBe(false)
  })

  it('should throw error when accessing width before loading', () => {
    const img = new GameImage('no.png')
    expect(() => img.width).toThrow(
      'Tried to get width before image was done loading: no.png.',
    )
  })

  it('should throw error when accessing height before loading', () => {
    const img = new GameImage('no.png')
    expect(() => img.height).toThrow(
      'Tried to get height before image was done loading: no.png.',
    )
  })
})

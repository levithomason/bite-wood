import { Vector } from './math.js'
import { GameDrawing } from './game-drawing.js'
import { GameObject } from './game-object.js'
import { GameSprite } from './game-sprite.js'
import { GameImage } from './game-image.js'

// jest-canvas-mock doesn't implement a mock for roundRect
Object.defineProperty(window.CanvasRenderingContext2D.prototype, 'roundRect', {
  value: function (x, y, w, h, r = 0) {
    if (typeof x === 'undefined') {
      throw new Error(
        "Uncaught TypeError: Failed to execute 'roundRect' on 'CanvasRenderingContext2D': 4 arguments required, but only 0 present.",
      )
    }

    if (typeof y === 'undefined') {
      throw new Error(
        "Uncaught TypeError: Failed to execute 'roundRect' on 'CanvasRenderingContext2D': 4 arguments required, but only 1 present.",
      )
    }

    if (typeof w === 'undefined') {
      throw new Error(
        "Uncaught TypeError: Failed to execute 'roundRect' on 'CanvasRenderingContext2D': 4 arguments required, but only 2 present.",
      )
    }

    if (typeof h === 'undefined') {
      throw new Error(
        "Uncaught TypeError: Failed to execute 'roundRect' on 'CanvasRenderingContext2D': 4 arguments required, but only 3 present.",
      )
    }
  },
})

describe('GameDrawing', () => {
  it('throws if missing width', () => {
    expect(() => new GameDrawing(undefined, 0)).toThrowError(
      'GameDrawing constructor missing width.',
    )
  })
  it('throws if missing height', () => {
    expect(() => new GameDrawing(0, undefined)).toThrowError(
      'GameDrawing constructor missing height.',
    )
  })
  describe('method chaining', () => {
    /** @type GameDrawing */
    let drawing

    beforeEach(() => {
      drawing = new GameDrawing(10, 10)
    })

    //
    // Settings
    //

    it('saveSettings() returns this', () => {
      expect(drawing.saveSettings() === drawing).toBe(true)
    })

    it('loadSettings() returns this', () => {
      expect(drawing.loadSettings() === drawing).toBe(true)
    })

    it('setBlendMode() returns this', () => {
      expect(drawing.setBlendMode('difference') === drawing).toBe(true)
    })

    it('setCanvasSize() returns this', () => {
      expect(drawing.setCanvasSize(0, 0) === drawing).toBe(true)
    })

    it('setFillColor() returns this', () => {
      expect(drawing.setFillColor('red') === drawing).toBe(true)
    })

    it('setFontFamily() returns this', () => {
      expect(drawing.setFontFamily('monospace') === drawing).toBe(true)
    })

    it('setFontSize() returns this', () => {
      expect(drawing.setFontSize(12) === drawing).toBe(true)
    })

    it('setLineWidth() returns this', () => {
      expect(drawing.setLineWidth(0) === drawing).toBe(true)
    })

    it('setStrokeColor() returns this', () => {
      expect(drawing.setStrokeColor('red') === drawing).toBe(true)
    })

    it('setTextAlign() returns this', () => {
      expect(drawing.setTextAlign('center') === drawing).toBe(true)
    })

    it('setTextBaseline() returns this', () => {
      expect(drawing.setTextBaseline('top') === drawing).toBe(true)
    })

    //
    // Drawing
    //

    it('arrow() returns this', () => {
      expect(drawing.arrow(0, 0, 1, 1) === drawing).toBe(true)
    })

    it('circle() returns this', () => {
      expect(drawing.circle(0, 0, 0) === drawing).toBe(true)
    })

    it('clear() returns this', () => {
      expect(drawing.clear() === drawing).toBe(true)
    })

    it('cross() returns this', () => {
      expect(drawing.cross(0, 0) === drawing).toBe(true)
    })

    it('ellipse() returns this', () => {
      expect(drawing.ellipse(0, 0, 0, 0) === drawing).toBe(true)
    })

    it('fill() returns this', () => {
      expect(drawing.fill('red') === drawing).toBe(true)
    })

    it('grid() returns this', () => {
      expect(drawing.grid(10) === drawing).toBe(true)
    })

    it('image() returns this', () => {
      expect(drawing.image(new Image()) === drawing).toBe(true)
    })

    it('imageData() returns this', () => {
      expect(drawing.imageData(new ImageData(1, 1)) === drawing).toBe(true)
    })

    it('line() returns this', () => {
      expect(drawing.line(0, 0, 1, 1) === drawing).toBe(true)
    })

    it('pixel() returns this', () => {
      expect(drawing.pixel(0, 0) === drawing).toBe(true)
    })

    it('polygon() returns this', () => {
      expect(drawing.polygon([[0, 0]]) === drawing).toBe(true)
    })

    it('rectangle() returns this', () => {
      expect(drawing.rectangle(0, 0, 1, 1) === drawing).toBe(true)
    })

    it('roundedRectangle() returns this', () => {
      expect(drawing.roundedRectangle(0, 0, 1, 1, 1) === drawing).toBe(true)
    })

    it('sprite() returns this', () => {
      const gameSprite = new GameSprite(new GameImage(), {
        frameWidth: 0,
        frameHeight: 0,
      })

      expect(drawing.sprite(gameSprite, 0, 0) === drawing).toBe(true)
    })

    it('strokeText() returns this', () => {
      expect(drawing.strokeText('text', 0, 0) === drawing).toBe(true)
    })

    it('text() returns this', () => {
      expect(drawing.text() === drawing).toBe(true)
    })

    it('fpsDebug() returns this', () => {
      expect(drawing.fpsDebug(60) === drawing).toBe(true)
    })

    it('mouseDebug() returns this', () => {
      expect(drawing.mouseDebug(0, 0) === drawing).toBe(true)
    })

    it('objectDebug() returns this', () => {
      expect(drawing.objectDebug(new GameObject()) === drawing).toBe(true)
    })

    it('vectorDebug() returns this', () => {
      const vector = new Vector()
      expect(drawing.vectorDebug(0, 0, vector) === drawing).toBe(true)
    })

    it('measureText() returns a number', () => {
      expect(drawing.measureText('a')).toBe(1)
      expect(drawing.measureText('foo')).toBe(3)
      expect(drawing.measureText('foobarbaz')).toBe(9)
    })
  })
})

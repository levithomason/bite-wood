import { GameDrawing } from './game-drawing.js'
import { Vector } from './math.js'
import { GameObject } from './game-object.js'
import { GameSprite } from './game-sprite.js'
import { gameRooms } from './game-rooms.js'
import { GameRoom } from './game-room.js'
import { Game } from './game.js'
import { GameImage } from './game-image.js'

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

    it('saveSettings() returns this', () => {
      expect(drawing.saveSettings() === drawing).toBe(true)
    })

    it('loadSettings() returns this', () => {
      expect(drawing.loadSettings() === drawing).toBe(true)
    })

    it('setCanvasWidth() returns this', () => {
      expect(drawing.setCanvasWidth(0) === drawing).toBe(true)
    })

    it('setCanvasHeight() returns this', () => {
      expect(drawing.setCanvasHeight(0) === drawing).toBe(true)
    })

    it('setFillColor() returns this', () => {
      expect(drawing.setFillColor('red') === drawing).toBe(true)
    })

    it('setLineWidth() returns this', () => {
      expect(drawing.setLineWidth(0) === drawing).toBe(true)
    })

    it('setStrokeColor() returns this', () => {
      expect(drawing.setStrokeColor('red') === drawing).toBe(true)
    })

    it('arrow() returns this', () => {
      expect(drawing.arrow(0, 0, 1, 1) === drawing).toBe(true)
    })

    it('clear() returns this', () => {
      expect(drawing.clear() === drawing).toBe(true)
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

    it('sprite() returns this', () => {
      const gameSprite = new GameSprite({
        image: new GameImage(),
        frameWidth: 0,
        frameHeight: 0,
        boundingBoxWidth: 0,
        boundingBoxHeight: 0,
      })

      expect(drawing.sprite(gameSprite, 0, 0) === drawing).toBe(true)
    })

    it('text() returns this', () => {
      expect(drawing.text() === drawing).toBe(true)
    })

    it('textAlign() returns this', () => {
      expect(drawing.textAlign('center') === drawing).toBe(true)
    })

    // TODO: This test is revealing some bad arch.
    //       Refactor so drawing debug doesn't require creating a room and inserting an object.
    //       This is due to the fact that the draw method checks for collisions.
    //       The collision logic requires currentRoom.objects to find collisions.
    //       Collisions should only register a check, then game step can call all the checks.
    it('objectDebug() returns this', () => {
      gameRooms.addRoom(new GameRoom(10, 10))

      const object = new GameObject({
        sprite: new GameSprite({
          image: new GameImage(),
          frameWidth: 0,
          frameHeight: 0,
          boundingBoxWidth: 0,
          boundingBoxHeight: 0,
        }),
      })
      expect(drawing.objectDebug(object) === drawing).toBe(true)
    })

    it('vectorDebug() returns this', () => {
      const vector = new Vector(0, 0)
      expect(drawing.vectorDebug(0, 0, vector) === drawing).toBe(true)
    })
  })
})

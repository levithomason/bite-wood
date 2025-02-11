import { toRadians } from './math.js'
import { Vector } from './vector.js'
import { gameMouse } from './game-mouse-controller.js'
import { isColliding } from './collision.js'
import { gameCamera } from './game-camera-controller.js'
import { gameDrawing } from './game-drawing-controller.js'
import { GameImage } from './game-image.js'
import { GameObject } from './game-object.js'
import { GameSprite } from './game-sprite.js'
import { GameParticles } from './game-particles.js'

/** Provides a canvas and helpful methods for drawing on it. */
export class GameDrawing {
  readonly #ctx: CanvasRenderingContext2D
  canvas: HTMLCanvasElement

  constructor(width: number, height: number) {
    if (width === undefined) {
      throw new Error('GameDrawing constructor missing width.')
    }
    if (height === undefined) {
      throw new Error('GameDrawing constructor missing height.')
    }
    this.canvas = document.createElement('canvas')
    const ctx = this.canvas.getContext('2d')
    if (!ctx) {
      throw new Error('Could not get 2d context from canvas.')
    }
    this.#ctx = ctx

    this.setCanvasSize(width, height)

    return this
  }

  /** Moves the camera by x and y. */
  moveCamera(x: number, y: number): GameDrawing {
    this.#ctx.translate(-x, -y)
    return this
  }

  //
  // Settings
  //

  /** Saves the current drawing settings, such as colors and widths. */
  saveSettings(): GameDrawing {
    this.#ctx.save()
    return this
  }

  /** Loads the previously saved drawing settings, such as colors and widths. */
  loadSettings(): GameDrawing {
    this.#ctx.restore()
    return this
  }

  /**
   * Sets the blend mode for drawing shapes.
   * @param mode - An HTML Canvas GlobalCompositeOperation.
   */
  setBlendMode(mode: GlobalCompositeOperation): GameDrawing {
    this.#ctx.globalCompositeOperation = mode
    return this
  }

  /**
   * Sets the width and height of the canvas.
   * @param width - Set display size in pixels.
   * @param height - Set display size in pixels.
   */
  setCanvasSize(width: number, height: number): GameDrawing {
    this.canvas.style.width = `${width}px`
    this.canvas.style.height = `${height}px`

    // Set actual width and height in memory (scaled to account for extra pixel density).
    const scale = window.devicePixelRatio // prevent blurriness on high-res displays
    this.canvas.width = Math.floor(width * scale)
    this.canvas.height = Math.floor(height * scale)

    // Normalize coordinate system to use CSS pixels.
    this.#ctx.scale(scale, scale)

    return this
  }

  /**
   * Sets the fill color for drawing shapes.
   * @param color - A CSS color string, gradient, or pattern.
   */
  setFillColor(color: string | CanvasGradient | CanvasPattern): GameDrawing {
    this.#ctx.fillStyle = color
    return this
  }

  /**
   * Creates a linear gradient fill color.
   */
  createLinearGradient(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
  ): CanvasGradient {
    return this.#ctx.createLinearGradient(x1, y1, x2, y2)
  }

  /**
   * Sets font family, independent of font size.
   * @param fontFamily - A CSS font-family string.
   */
  setFontFamily(fontFamily: string = 'Pixellari, monospace'): GameDrawing {
    this.#ctx.font = this.#ctx.font.replace(/(\d+px).*/, `$1 ${fontFamily}`)
    return this
  }

  /**
   * Sets font size, independent of font family.
   * @param size - The size of the font in pixels.
   */
  setFontSize(size: number = 16): GameDrawing {
    this.#ctx.font = this.#ctx.font.replace(/\d+px/, `${size}px`)
    return this
  }

  /**
   * Sets the line width for drawing shapes.
   */
  setLineWidth(width: number): GameDrawing {
    this.#ctx.lineWidth = width
    return this
  }

  /**
   * Sets the line cap for drawing shapes.
   */
  setLineCap(lineCap: CanvasLineCap): GameDrawing {
    this.#ctx.lineCap = lineCap
    return this
  }

  /**
   */
  setStrokeColor(color: string | CanvasGradient | CanvasPattern): GameDrawing {
    this.#ctx.strokeStyle = color
    return this
  }

  /**
   * Sets the text alignment for drawing text.
   */
  setTextAlign(alignment: CanvasTextAlign): GameDrawing {
    this.#ctx.textAlign = alignment
    return this
  }

  /**
   * Sets the text baseline for drawing text.
   */
  setTextBaseline(baseline: CanvasTextBaseline): GameDrawing {
    this.#ctx.textBaseline = baseline
    return this
  }

  //
  // Drawing
  //

  /**
   * Draws a line between two points with an arrow head of size arrowSize.
   */
  arrow(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    arrowSize: number = 6,
  ): GameDrawing {
    const size = arrowSize + this.#ctx.lineWidth // length of head in pixels
    const angle = Math.atan2(y2 - y1, x2 - x1)

    // line
    this.line(x1, y1, x2, y2)

    // arrow head
    this.#ctx.beginPath()
    this.#ctx.moveTo(x2, y2)
    this.#ctx.lineTo(
      x2 - size * Math.cos(angle - Math.PI / 6),
      y2 - size * Math.sin(angle - Math.PI / 6),
    )
    this.#ctx.lineTo(
      x2 - size * Math.cos(angle + Math.PI / 6),
      y2 - size * Math.sin(angle + Math.PI / 6),
    )
    this.#ctx.lineTo(x2, y2)

    // Intuition is for the arrow head color to match the stroke width.
    // Temporarily copy the stroke color to the fill color to fill the arrow head.
    const prevFill = this.#ctx.fillStyle
    this.setFillColor(this.#ctx.strokeStyle)
    this.#ctx.fill()
    this.setFillColor(prevFill)

    return this
  }

  /**
   * Strokes and fills a circle centered on x, y.
   */
  circle(x: number, y: number, radius: number): GameDrawing {
    this.#ctx.beginPath()
    this.#ctx.arc(x, y, radius, 0, 2 * Math.PI)
    this.#ctx.stroke()
    this.#ctx.fill()

    return this
  }

  /**
   * Clears the entire canvas by default, or only the rectangle specified.
   */
  clear(
    x1: number = 0,
    y1: number = 0,
    w: number = this.canvas.width,
    h: number = this.canvas.height,
  ): GameDrawing {
    this.#ctx.clearRect(x1, y1, w, h)

    return this
  }

  /**
   * Draws a cross at x, y with the specified width and height.
   */
  cross(
    x: number,
    y: number,
    width: number = 10,
    height: number = 10,
  ): GameDrawing {
    this.line(x - width, y, x + width, y)
    this.line(x, y - height, x, y + height)

    return this
  }

  /**
   * Strokes and fills an ellipse centered on x, y. Rotation is in degrees.
   */
  ellipse(
    x: number,
    y: number,
    radiusX: number,
    radiusY: number,
    rotation: number = 0,
  ): GameDrawing {
    this.#ctx.beginPath()
    this.#ctx.ellipse(
      x,
      y,
      radiusX,
      radiusY,
      toRadians(rotation),
      0,
      2 * Math.PI,
    )
    this.#ctx.stroke()
    this.#ctx.fill()

    return this
  }

  /**
   * Fills the entire canvas with a color.
   */
  fill(color: string): GameDrawing {
    this.setFillColor(color)
    this.#ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

    return this
  }

  /**
   * Draws a grid of horizontal and vertical lines.
   */
  grid(
    cellSize: number = 16,
    x: number = 0,
    y: number = 0,
    width: number = this.canvas.width,
    height: number = this.canvas.height,
  ): GameDrawing {
    const _drawLines = () => {
      // horizontals
      for (let i = 0; i < width; i += cellSize) {
        this.line(i, 0, i, height)
      }

      // verticals
      for (let i = 0; i < height; i += cellSize) {
        this.line(0, i, width, i)
      }
    }

    this.saveSettings()
    this.setStrokeColor('#ffffff22')
    const { globalCompositeOperation } = this.#ctx
    this.#ctx.globalCompositeOperation = 'difference'
    _drawLines()
    this.#ctx.globalCompositeOperation = globalCompositeOperation

    this.loadSettings()

    return this
  }

  /**
   * Draws an image on top of the canvas at x, y.
   */
  image(
    image: GameImage | HTMLImageElement | HTMLCanvasElement,
    x: number = 0,
    y: number = 0,
  ): GameDrawing {
    // GameImage has an element property, otherwise this is an image/canvas.
    const drawable = image instanceof GameImage ? image.element : image

    this.#ctx.imageSmoothingEnabled = false
    this.#ctx.drawImage(drawable, x, y)

    return this
  }

  /**
   * Places pixelated image data at x, y.
   */
  imageData(imageData: ImageData, x: number = 0, y: number = 0): GameDrawing {
    this.#ctx.imageSmoothingEnabled = false
    this.#ctx.putImageData(imageData, x, y)

    return this
  }

  /**
   * Strokes a line between two points.
   */
  line(x1: number, y1: number, x2: number, y2: number): GameDrawing {
    this.#ctx.beginPath()
    this.#ctx.moveTo(x1, y1)
    this.#ctx.lineTo(x2, y2)
    this.#ctx.stroke()

    return this
  }

  /**
   * Fills a single pixel.
   */
  pixel(x: number, y: number): GameDrawing {
    this.#ctx.fillRect(x, y, 1, 1)

    return this
  }

  /**
   * Draws a polygon using an array of x, y coordinates as vertices.
   * @param vertices - A 2d array of vertices: [[x1, y1], [x2, y2], ...]
   */
  polygon(vertices: [number, number][]): GameDrawing {
    const [start, ...rest] = vertices

    this.#ctx.beginPath()
    this.#ctx.moveTo(start[0], start[1])
    rest.forEach(([x, y]) => this.#ctx.lineTo(x, y))
    this.#ctx.fill()
    this.#ctx.stroke()

    return this
  }

  /**
   * Strokes and fills a rectangle at x, y with a width and height.
   */
  rectangle(x: number, y: number, w: number, h: number) {
    this.#ctx.fillRect(x, y, w, h)
    this.#ctx.strokeRect(x, y, w, h)

    return this
  }

  /**
   * Strokes and fills a rounded rectangle at x, y with a width and height.
   */
  roundedRectangle(x: number, y: number, w: number, h: number, radii: number) {
    this.#ctx.beginPath()
    this.#ctx.roundRect(x, y, w, h, radii)
    this.#ctx.fill()
    this.#ctx.stroke()

    return this
  }

  /**
   * Draws a sprite on top of the canvas at x, y.
   * The current frame of the sprite is drawn at the current scale of the sprite.
   */
  sprite(sprite: GameSprite, x: number, y: number): GameDrawing {
    this.#ctx.imageSmoothingEnabled = false
    this.#ctx.drawImage(
      sprite.image.element,
      sprite.currentFrameX,
      sprite.currentFrameY,
      sprite.frameWidth,
      sprite.frameHeight,
      x - sprite.insertionX,
      y - sprite.insertionY,
      sprite.width,
      sprite.height,
    )

    return this
  }

  /**
   * Strokes text at x, y.
   */
  strokeText(text: string, x: number, y: number): GameDrawing {
    this.#ctx.strokeText(text, x, y)

    return this
  }

  /**
   * Fills text at x, y.
   */
  text(text: string, x: number, y: number) {
    this.#ctx.fillText(text, x, y)

    return this
  }

  //
  // Debug
  //

  /**
   * Draws a debug view of the camera.
   */
  cameraDebug() {
    this.saveSettings()

    this.setLineWidth(1)
    this.setFillColor('transparent')
    this.setStrokeColor('#00ffff88')
    this.rectangle(
      gameCamera.x + 8,
      gameCamera.y + 8,
      gameCamera.width - 16,
      gameCamera.height - 16,
    )

    this.loadSettings()

    return this
  }

  /**
   * Draws a debug view of the current frames per second.
   */
  fpsDebug(fps: number) {
    this.saveSettings()
    this.setStrokeColor('transparent')

    const canvasWidth = parseInt(gameDrawing.canvas.style.width, 10)
    const top = 0
    const text = Math.round(fps) + ' FPS'
    const textPaddingX = 8
    const textPaddingY = 4
    const textMargin = 8
    const textHeight = 12
    this.setFontFamily('monospace')
    this.setFontSize(textHeight)
    this.setTextAlign('center')
    this.setTextBaseline('middle')
    const textWidth = this.measureText(text)

    this.setFillColor('rgba(0, 0, 0, 0.25)')
    this.rectangle(
      canvasWidth - textMargin - textPaddingX * 2 - textWidth,
      top + textMargin,
      textWidth + textPaddingX * 2,
      textHeight + textPaddingY * 2,
    )

    this.setFillColor('#fff')
    this.text(
      text,
      canvasWidth - textMargin - textPaddingX - textWidth / 2,
      textMargin + textPaddingY + textHeight / 2,
    )

    this.loadSettings()

    return this
  }

  /**
   * Draws a debug view of a mouse position.
   */
  mouseDebug() {
    const height = 15
    const offsetBottom = 24

    const padX = 60

    let x = gameMouse.x - gameCamera.x

    if (gameMouse.x < gameCamera.left + padX) {
      x = gameCamera.left + padX - gameCamera.x
    } else if (gameMouse.x > gameCamera.right - padX) {
      x = gameCamera.right - padX - gameCamera.x
    }

    let y = gameMouse.y + offsetBottom - gameCamera.y

    if (gameMouse.y < gameCamera.top) {
      y = offsetBottom - gameCamera.y
    } else if (gameMouse.y > gameCamera.bottom - height) {
      y = gameCamera.bottom - offsetBottom - height - gameCamera.y
    } else if (gameMouse.y > gameCamera.bottom - offsetBottom - height) {
      y = gameMouse.y - offsetBottom - gameCamera.y
    }

    const text = `(${gameMouse.x}, ${gameMouse.y})`

    this.saveSettings()

    this.setFontSize(10)
    this.setFontFamily('monospace')
    this.setTextAlign('center')
    this.setTextBaseline('top')

    // text background
    const textWidth = this.#ctx.measureText(text).width
    const textPadX = 4
    this.setStrokeColor('transparent')
    this.setFillColor('rgba(0, 0, 0, 0.25)')
    this.rectangle(
      x - textWidth / 2 - textPadX,
      y - 2,
      textWidth + textPadX * 2,
      height,
    )

    // text
    this.setLineWidth(1)
    this.setFillColor('#fff')
    this.text(text, x, y)

    this.loadSettings()

    return this
  }

  /**
   * Draws a debug view of a GameObject.
   */
  objectDebug(object: GameObject): GameDrawing {
    const {
      name,
      sprite,
      state,
      x,
      y,
      hspeed,
      vspeed,
      speed,
      direction,
      gravity,
      friction,
      boundingBoxTop,
      boundingBoxLeft,
      boundingBoxWidth,
      boundingBoxHeight,
    } = object

    this.saveSettings()

    this.setLineWidth(1)
    this.setFillColor('transparent')

    // sprite frame
    if (sprite) {
      this.setStrokeColor('rgba(0, 0, 0, 0.2)')
      this.rectangle(
        object.spriteLeft,
        object.spriteTop,
        sprite.width,
        sprite.height,
      )
    }

    // bounding box
    if (isColliding(object)) {
      this.setStrokeColor('#F80')
    } else {
      this.setStrokeColor('#08F')
    }
    this.rectangle(
      boundingBoxLeft,
      boundingBoxTop,
      boundingBoxWidth,
      boundingBoxHeight,
    )

    // insertion point
    this.setStrokeColor('#F00')
    this.cross(x, y, 6, 6)

    // vector
    if (speed) {
      this.setStrokeColor('#0D0')
      this.arrow(x, y, x + hspeed * 4, y + vspeed * 4, 4)
    }

    // text values
    this.setFontSize(12)
    this.setFontFamily('monospace')
    this.setTextAlign('left')
    const fixed = (n: number) => n.toFixed(2)
    const lines = [
      `${name}`,
      // TODO: make state a required abstraction of game objects
      state && `state     ${state.name}`,
      `x         ${fixed(x)}`,
      `y         ${fixed(y)}`,
      `direction ${fixed(direction)}`,
      `speed     ${fixed(speed)} (${fixed(hspeed)}, ${fixed(vspeed)})`,
      gravity && `gravity   ${fixed(gravity.magnitude)}`,
      friction && `friction  ${fixed(friction)}`,
    ]

    for (let i = 0; i < lines.reverse().length; i++) {
      const line = lines[i]
      if (typeof line !== 'string' || !line.trim()) continue

      const x = object.spriteLeft
      const y = object.spriteTop - (i + 1) * 14
      this.setFillColor('#000')
      this.text(line, x, y)
    }
    this.loadSettings()

    return this
  }

  /**
   * Draws a debug view of a Vector. Color is a CSS color for the debug lines.
   */
  vectorDebug(
    x: number,
    y: number,
    vector: Vector,
    color: string = 'black',
  ): GameDrawing {
    this.saveSettings()
    const mainColor = 'magenta'

    this.setStrokeColor(color)
    this.setFillColor('transparent')

    // adjacent
    this.line(x, y, x + vector.x, y)
    // opposite
    this.line(x + vector.x, y, x + vector.x, y + vector.y)
    // hypotenuse
    this.setStrokeColor(mainColor)
    this.arrow(x, y, x + vector.x, y + vector.y)

    // 90° box
    this.setStrokeColor(color)
    this.rectangle(
      x + vector.x + 10 * -Math.sign(vector.x),
      y,
      10 * Math.sign(vector.x),
      10 * Math.sign(vector.y),
    )

    // labels: x, y, angle, magnitude
    const fontSize = 12
    this.setFontSize(fontSize)
    this.setTextAlign('center')
    this.setFillColor(mainColor)
    this.text(
      Math.round(vector.magnitude).toString(),
      x + vector.x / 2 - 20 * Math.sign(vector.x),
      y + vector.y / 2 + fontSize * 1.2 * Math.sign(vector.y),
    )

    this.setFillColor(color)
    this.text(
      'x ' + Math.round(vector.x),
      x + vector.x / 2,
      y + 15 * -Math.sign(vector.y),
    )
    this.text(
      'y ' + Math.round(vector.y),
      x + vector.x + 30 * Math.sign(vector.x),
      y + vector.y / 2,
    )
    this.text(
      Math.round(vector.direction) + '°',
      x + vector.x / 4,
      y + vector.y / 10 + 4,
    )

    this.loadSettings()

    return this
  }

  // TODO: move to game loop, put particles on a separate layer
  //       don't extend GameObject for GameParticles
  //       otherwise, GameParticles get GameObject treatment (like debug drawing)
  particlesDebug(particles: GameParticles) {
    this.saveSettings()
    this.setLineWidth(1)
    this.setFillColor('transparent')
    this.setStrokeColor('#ff0')
    this.rectangle(particles.x, particles.y, particles.width, particles.height)
    this.loadSettings()
  }

  //
  // Utilities
  //

  /**
   * Returns the width of a string on the canvas.
   */
  measureText(text: string): number {
    return this.#ctx.measureText(text).width
  }
}

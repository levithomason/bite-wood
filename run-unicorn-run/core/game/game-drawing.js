import * as collision from '../collision.js'

///////////////////////////////////////////

export default class GameDrawing {
  constructor(width, height) {
    if (typeof width === 'undefined' || typeof height === 'undefined') {
      throw new Error('GameDrawing constructor missing width or height.')
    }
    this.canvas = document.createElement('canvas')
    this.canvas.setAttribute('width', width)
    this.canvas.setAttribute('height', height)

    this._ctx = this.canvas.getContext('2d')
    // render pixelated images
    this._ctx.imageSmoothingEnabled = false

    // align coordinates to pixel centers instead of pixel grid lines (between pixels)
    this._ctx.translate(0.5, 0.5)

    this.saveSettings = this.saveSettings.bind(this)
    this.loadSettings = this.loadSettings.bind(this)
    this.setColor = this.setColor.bind(this)
    this.setBorderColor = this.setBorderColor.bind(this)
    this.setFillColor = this.setFillColor.bind(this)
    this.setLineWidth = this.setLineWidth.bind(this)
    this.clear = this.clear.bind(this)
    this.image = this.image.bind(this)
    this.imageData = this.imageData.bind(this)
    this.sprite = this.sprite.bind(this)
    this.fill = this.fill.bind(this)
    this.pixel = this.pixel.bind(this)
    this.line = this.line.bind(this)
    this.arrow = this.arrow.bind(this)
    this.rectangle = this.rectangle.bind(this)
    this.polygon = this.polygon.bind(this)
    this.text = this.text.bind(this)
    this.textAlign = this.textAlign.bind(this)
    this.grid = this.grid.bind(this)
    this.objectDebug = this.objectDebug.bind(this)
    this.vectorDebug = this.vectorDebug.bind(this)
  }

  saveSettings() {
    this._ctx.save()
  }

  loadSettings() {
    this._ctx.restore()
  }

  //
  // Color
  //
  setColor(color) {
    this.setBorderColor(color)
    this.setFillColor(color)
  }
  setBorderColor(color) {
    this._ctx.strokeStyle = color
  }

  setFillColor(color) {
    this._ctx.fillStyle = color
  }

  //
  // Line
  //
  setLineWidth(width) {
    this._ctx.lineWidth = width
  }

  //
  // Erase
  //
  clear(
    x1 = 0,
    y1 = 0,
    w = this._ctx.canvas.width,
    h = this._ctx.canvas.height,
  ) {
    this._ctx.clearRect(x1, y1, w, h)
  }

  //
  // Images
  //
  /**
   * @param {GameImage} image
   * @param {number} x
   * @param {number} y
   */
  image(image, x = 0, y = 0) {
    this._ctx.drawImage(image.element, x, y)
  }

  /**
   * @param {ImageData|CanvasImageData} imageData
   * @param {number} x
   * @param {number} y
   */
  imageData(imageData, x = 0, y = 0) {
    this._ctx.putImageData(imageData, x, y)
  }

  /**
   * @param {number} x
   * @param {number} y
   * @param {GameSprite} sprite
   */
  sprite(sprite, x, y) {
    const direction = sprite.rtl ? -1 : 1
    const rtlWidth = sprite.frameWidth * direction
    const rtlInsertionX = sprite.insertionX * direction

    this._ctx.drawImage(
      sprite.image.element,
      sprite.offsetX + sprite.frameIndex * rtlWidth,
      sprite.offsetY,
      rtlWidth,
      sprite.frameHeight,
      x - rtlInsertionX * sprite.scaleX,
      y - sprite.insertionY * sprite.scaleY,
      rtlWidth * sprite.scaleX,
      sprite.frameHeight * sprite.scaleY,
    )
  }

  //
  // Basic Shapes
  //
  fill(color) {
    this.saveSettings()
    this.setColor(color)
    this.rectangle(0, 0, this.canvas.width, this.canvas.height)
    this.loadSettings()
  }

  pixel(x, y) {
    debugger
    this._ctx.fillRect(x, y, 1, 1)
  }

  line(x1, y1, x2, y2) {
    this._ctx.beginPath()
    this._ctx.moveTo(x1, y1)
    this._ctx.lineTo(x2, y2)
    this._ctx.stroke()
  }

  arrow(x1, y1, x2, y2) {
    const size = 6 + this._ctx.lineWidth // length of head in pixels
    const angle = Math.atan2(y2 - y1, x2 - x1)

    // line
    this.line(x1, y1, x2, y2)

    // arrow head
    this._ctx.beginPath()
    this._ctx.moveTo(x2, y2)
    this._ctx.lineTo(
      x2 - size * Math.cos(angle - Math.PI / 6),
      y2 - size * Math.sin(angle - Math.PI / 6),
    )
    this._ctx.lineTo(
      x2 - size * Math.cos(angle + Math.PI / 6),
      y2 - size * Math.sin(angle + Math.PI / 6),
    )
    this._ctx.lineTo(x2, y2)
    this._ctx.fill()
  }

  rectangle(x, y, w, h) {
    this._ctx.fillRect(x, y, w, h)
    this._ctx.strokeRect(x, y, w, h)
  }

  polygon(verticies) {
    const [start, ...rest] = verticies

    this._ctx.beginPath()
    this._ctx.moveTo(start[0], start[1])
    rest.forEach(([x, y]) => this._ctx.lineTo(x, y))
    this._ctx.fill()
    this._ctx.stroke()
  }

  text(text, x, y) {
    this._ctx.fillText(text, x, y)
  }

  textAlign(alignment) {
    this._ctx.textAlign = alignment
  }

  //
  // Complex Shapes
  //

  grid(
    cellSize = 16,
    x = 0,
    y = 0,
    width = this._ctx.canvas.width,
    height = this._ctx.canvas.height,
  ) {
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
    this._ctx.setLineDash([1, 3])
    this._ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)'
    _drawLines()
    this._ctx.lineDashOffset = 1
    this._ctx.strokeStyle = 'rgba(0, 0, 0, 0.75)'
    _drawLines()

    this.loadSettings()
  }

  objectDebug(object) {
    const {
      sprite,
      x,
      y,
      hspeed,
      vspeed,
      speed,
      direction,
      gravity,
      friction,
    } = object

    this.saveSettings()

    // bounding box
    if (collision.objects(object, 'any')) {
      this.setBorderColor('#F00')
    } else {
      this.setBorderColor('#FF0')
    }
    this.setFillColor('transparent')
    this.rectangle(
      x -
        sprite.insertionX * sprite.scaleX +
        sprite.boundingBoxLeft * sprite.scaleX,
      y -
        sprite.insertionY * sprite.scaleY +
        sprite.boundingBoxTop * sprite.scaleY,
      sprite.boundingBoxWidth * sprite.scaleX,
      sprite.boundingBoxHeight * sprite.scaleY,
    )

    // sprite frame
    this.setBorderColor('#555')
    this._ctx.setLineDash([2, 2])
    this.rectangle(
      x - sprite.insertionX * sprite.scaleX,
      y - sprite.insertionY * sprite.scaleY,
      sprite.frameWidth * sprite.scaleX,
      sprite.frameHeight * sprite.scaleY,
    )
    this._ctx.setLineDash([])

    // insertion point
    this.setLineWidth(3)
    this.setBorderColor('#F00')
    this.line(x - 10, y, x + 10, y)
    this.line(x, y - 10, x, y + 10)

    // vector
    if (object.speed) {
      this.setColor('#0F0')
      this.arrow(x, y, x + object.hspeed * 10, y + object.vspeed * 10)
    }

    this.setColor('#000')
    // text values
    this._ctx.font = '12px monospace'
    this._ctx.textAlign = 'left'
    const lines = [
      `x          = ${x.toFixed(2)}`,
      `y          = ${y.toFixed(2)}`,
      `direction  = ${direction.toFixed(2)}`,
      `speed      = ${speed.toFixed(2)}`,
      `hspeed     = ${hspeed.toFixed(2)}`,
      `vspeed     = ${vspeed.toFixed(2)}`,
      `gravity    = ${gravity.toFixed(2)}`,
      `friction   = ${friction.toFixed(2)}`,
      `boundingBoxTop    = ${object.boundingBoxTop.toFixed(2)}`,
      `boundingBoxLeft   = ${object.boundingBoxLeft.toFixed(2)}`,
      `boundingBoxBottom = ${object.boundingBoxBottom.toFixed(2)}`,
      `boundingBoxRight  = ${object.boundingBoxRight.toFixed(2)}`,
    ]
    lines.reverse().forEach((line, i) => {
      this.text(
        line,
        x - sprite.insertionX,
        y - sprite.frameHeight - sprite.insertionY - 4 - i * 14,
      )
    })
    this.loadSettings()
  }

  vectorDebug(x, y, vector) {
    this.saveSettings()

    // adjacent
    this.line(x, y, x + vector.x, y)
    // opposite
    this.line(x + vector.x, y, x + vector.x, y + vector.y)
    // hypotenuse
    this.setColor('red')
    this.arrow(x, y, x + vector.x, y + vector.y)

    // 90° box
    this.setBorderColor('black')
    this.setFillColor('transparent')
    this.rectangle(
      x + vector.x + 10 * -Math.sign(vector.x),
      y,
      10 * Math.sign(vector.x),
      10 * Math.sign(vector.y),
    )

    // labels: x, y, angle, magnitude
    this.textAlign('center')
    this.setFillColor('red')
    this.text(
      Math.round(vector.magnitude),
      x + vector.x / 2 - 20 * Math.sign(vector.x),
      y + vector.y / 2,
    )

    this.setColor('black')
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
  }
}

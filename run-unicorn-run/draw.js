import * as utils from './utils.js'

let _ctx

///////////////////////////////////////////

export const init = (width = '800', height = '600') => {
  const canvas = document.createElement('canvas')
  canvas.setAttribute('width', width)
  canvas.setAttribute('height', height)

  _ctx = canvas.getContext('2d')
  // render pixelated images
  _ctx.imageSmoothingEnabled = false

  // align coordinates to pixel centers instead of pixel grid lines (between pixels)
  _ctx.translate(0.5, 0.5)

  return canvas
}

export const saveSettings = () => {
  _ctx.save()
}

export const loadSettings = () => {
  _ctx.restore()
}

//
// Color
//
export const setColor = color => {
  setBorderColor(color)
  setFillColor(color)
}
export const setBorderColor = color => {
  _ctx.strokeStyle = color
}

export const setFillColor = color => {
  _ctx.fillStyle = color
}

//
// Line
//
export const setLineWidth = width => {
  _ctx.lineWidth = width
}

//
// Erase
//
export const erase = () => {
  _ctx.clearRect(0, 0, _ctx.canvas.width, _ctx.canvas.height)
}

//
// Images
//

/**
 * @param {GameImage} image
 * @param {number} x
 * @param {number} y
 */
export const image = (image, x = 0, y = 0) => {
  _ctx.drawImage(image.element, x, y)
}

/**
 * @param {number} x
 * @param {number} y
 * @param {GameSprite} sprite
 */
export const sprite = (sprite, x, y) => {
  const direction = sprite.rtl ? -1 : 1
  const rtlWidth = sprite.frameWidth * direction
  const rtlInsertionX = sprite.insertionX * direction

  _ctx.drawImage(
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
export const pixel = (x, y) => {
  _ctx.fillRect(x, y, 1, 1)
}

export const line = (x1, y1, x2, y2) => {
  _ctx.beginPath()
  _ctx.moveTo(x1, y1)
  _ctx.lineTo(x2, y2)
  _ctx.stroke()
}

export const arrow = (x1, y1, x2, y2) => {
  const size = 6 + _ctx.lineWidth // length of head in pixels
  const angle = Math.atan2(y2 - y1, x2 - x1)

  // line
  line(x1, y1, x2, y2)

  // arrow head
  _ctx.beginPath()
  _ctx.moveTo(x2, y2)
  _ctx.lineTo(
    x2 - size * Math.cos(angle - Math.PI / 6),
    y2 - size * Math.sin(angle - Math.PI / 6),
  )
  _ctx.lineTo(
    x2 - size * Math.cos(angle + Math.PI / 6),
    y2 - size * Math.sin(angle + Math.PI / 6),
  )
  _ctx.lineTo(x2, y2)
  _ctx.fill()
}

export const rectangle = (x, y, w, h) => {
  _ctx.fillRect(x, y, w, h)
  _ctx.strokeRect(x, y, w, h)
}

export const polygon = verticies => {
  const [start, ...rest] = verticies

  _ctx.beginPath()
  _ctx.moveTo(start[0], start[1])
  rest.forEach(([x, y]) => _ctx.lineTo(x, y))
  _ctx.fill()
  _ctx.stroke()
}

export const text = (text, x, y) => {
  _ctx.fillText(text, x, y)
}

export const textAlign = alignment => {
  _ctx.textAlign = alignment
}

//
// Complex Shapes
//

export const grid = (
  cellSize = 5,
  x = 0,
  y = 0,
  width = _ctx.canvas.width,
  height = _ctx.canvas.height,
) => {
  const _drawLines = () => {
    // horizontals
    for (let i = 0; i < width; i += cellSize) {
      line(i * cellSize, 0, i * cellSize, height)
    }

    // verticals
    for (let i = 0; i < height; i += cellSize) {
      line(0, i * cellSize, width, i * cellSize)
    }
  }

  saveSettings()
  _ctx.setLineDash([3, 3])
  _ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)'
  _drawLines()
  _ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)'
  _ctx.lineDashOffset = Date.now() / 10000
  _drawLines()

  loadSettings()
}

export const objectDebug = object => {
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

  saveSettings()

  // bounding box
  // setBorderColor('rgba(255, 255, 255, 0.75)')
  setBorderColor('#FF0')
  setFillColor('transparent')
  rectangle(
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
  setBorderColor('#555')
  _ctx.setLineDash([2, 2])
  rectangle(
    x - sprite.insertionX * sprite.scaleX,
    y - sprite.insertionY * sprite.scaleY,
    sprite.frameWidth * sprite.scaleX,
    sprite.frameHeight * sprite.scaleY,
  )
  _ctx.setLineDash([])

  // insertion point
  setLineWidth(3)
  setBorderColor('#F00')
  line(x - 10, y, x + 10, y)
  line(x, y - 10, x, y + 10)

  // vector
  if (object.speed) {
    setColor('#0F0')
    arrow(x, y, x + object.hspeed * 10, y + object.vspeed * 10)
  }

  setColor('#000')
  // text values
  _ctx.font = '12px monospace'
  _ctx.textAlign = 'left'
  const lines = [
    `x          = ${x.toFixed(2)}`,
    `y          = ${y.toFixed(2)}`,
    `direction  = ${direction.toFixed(2)}`,
    `speed      = ${speed.toFixed(2)}`,
    `hspeed     = ${hspeed.toFixed(2)}`,
    `vspeed     = ${vspeed.toFixed(2)}`,
    `gravity    = ${gravity.toFixed(2)}`,
    `friction   = ${friction.toFixed(2)}`,
    `sprite.boundingBoxLeft   = ${sprite.boundingBoxLeft}`,
    `sprite.boundingBoxTop    = ${sprite.boundingBoxTop}`,
    `sprite.boundingBoxWidth  = ${sprite.boundingBoxWidth}`,
    `sprite.boundingBoxHeight = ${sprite.boundingBoxHeight}`,
  ]
  lines.reverse().forEach((line, i) => {
    text(
      line,
      x - sprite.insertionX,
      y - sprite.frameHeight - sprite.insertionY - 4 - i * 14,
    )
  })
  loadSettings()
}

export const vectorDebug = (x, y, vector) => {
  saveSettings()

  // adjacent
  line(x, y, x + vector.x, y)
  // opposite
  line(x + vector.x, y, x + vector.x, y + vector.y)
  // hypotenuse
  setColor('red')
  arrow(x, y, x + vector.x, y + vector.y)

  // 90° box
  setBorderColor('black')
  setFillColor('transparent')
  rectangle(
    x + vector.x + 10 * -Math.sign(vector.x),
    y,
    10 * Math.sign(vector.x),
    10 * Math.sign(vector.y),
  )

  // labels: x, y, angle, magnitude
  textAlign('center')
  setFillColor('red')
  text(
    Math.round(vector.magnitude),
    x + vector.x / 2 - 20 * Math.sign(vector.x),
    y + vector.y / 2,
  )

  setColor('black')
  text(
    'x ' + Math.round(vector.x),
    x + vector.x / 2,
    y + 15 * -Math.sign(vector.y),
  )
  text(
    'y ' + Math.round(vector.y),
    x + vector.x + 30 * Math.sign(vector.x),
    y + vector.y / 2,
  )
  text(
    Math.round(vector.direction) + '°',
    x + vector.x / 4,
    y + vector.y / 10 + 4,
  )

  loadSettings()
}

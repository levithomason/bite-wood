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
export const setBorderColor = color => {
  _ctx.strokeStyle = color
}

export const setFillColor = color => {
  _ctx.fillStyle = color
}

//
// Erase
//
export const erase = () => {
  _ctx.clearRect(0, 0, _ctx.canvas.width, _ctx.canvas.height)
}

export const image = (
  img,
  sx = 0,
  sy = 0,
  // TODO: simplify, args after this point only exist to drawing sprite frames
  // TODO: offload sprite frames to another func
  sw = img.width,
  sh = img.height,
  dx = 0,
  dy = 0,
  dw = img.width,
  dh = img.height,
) => {
  _ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh)
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
  const { sprite, x, y, hspeed, vspeed, speed, direction } = object

  // bounding box
  _ctx.setLineDash([3, 3])
  _ctx.strokeRect(
    x - sprite.insertionX * sprite.scaleX,
    y - sprite.insertionY * sprite.scaleY,
    sprite.frameWidth * sprite.scaleX,
    sprite.frameHeight * sprite.scaleY,
  )

  // insertion point
  _ctx.setLineDash([])
  _ctx.beginPath()
  _ctx.moveTo(x - 10, y)
  _ctx.lineTo(x + 10, y)
  _ctx.moveTo(x, y - 10)
  _ctx.lineTo(x, y + 10)
  _ctx.stroke()

  // text values
  _ctx.font = '12px monospace'
  _ctx.textAlign = 'left'
  const lines = [
    `x          = ${x}`,
    `y          = ${y}`,
    `direction  = ${direction}`,
    `speed      = ${speed}`,
    `hspeed     = ${hspeed}`,
    `vspeed     = ${vspeed}`,
  ]
  lines.reverse().forEach((text, i) => {
    _ctx.fillText(
      text,
      x - sprite.insertionX,
      y - sprite.frameHeight - sprite.insertionY - 4 - i * 14,
    )
  })
}

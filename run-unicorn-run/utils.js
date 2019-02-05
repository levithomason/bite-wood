export const toDegrees = radians => (radians * 180) / Math.PI

export const toRadians = degrees => (degrees * Math.PI) / 180

export const distance = (x1, y1, x2, y2) => {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
}

export const direction = (x1, y1, x2 = 0, y2 = 0) => {
  return toDegrees(Math.atan2(y2 - y1, x2 - x1))
}

export const unitCircleRadians = radians => radians + Math.PI

export const unitCircleDegrees = degrees => degrees + 180

export const move = (x, y, direction, distance) => ({
  x: x + distance * Math.cos((direction * Math.PI) / 180),
  y: y + distance * Math.sin((direction * Math.PI) / 180),
})

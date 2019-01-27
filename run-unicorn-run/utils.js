export const distance = (x1, y1, x2, y2) => {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
}

export const move = (x, y, direction, distance) => {
  return {
    x: x + distance * Math.cos((direction * Math.PI) / 180),
    y: y + distance * Math.sin((direction * Math.PI) / 180),
  }
}

export function clear(array) {
  return fill(array, 0, 0, 0, 0)
}
/**
 * @param {number|[]} lengthOrArray
 * @return {Uint8ClampedArray}
 */
export function arrayFrom(lengthOrArray) {
  return new Uint8ClampedArray(lengthOrArray)
}

export function fill(array, r = 0, g = 0, b = 0, a = 255) {
  return mapPixels(array, () => [r, g, b, a])
}

export function xyToIndex(width, x, y) {
  return (y * width + x) * 4
}

export function getPixel(array, width, x, y) {
  const i = xyToIndex(width, x, y)
  return [
    array[i + 0], // r
    array[i + 1], // g
    array[i + 2], // b
    array[i + 3], // a
  ]
}

/**
 * @param {Uint8ClampedArray} array
 * @param {number} width
 * @param {number} x
 * @param {number} y
 * @param {[number, number, number, number]} pixel
 * @return {Uint8ClampedArray}
 */
export function drawPixel(array, width, x, y, [r, g, b, a]) {
  const cloned = arrayFrom(array)

  return drawPixelMutate(cloned, width, x, y, [r, g, b, a])
}

/**
 * @param {Uint8ClampedArray} array
 * @param {number} width
 * @param {number} x
 * @param {number} y
 * @param {[number, number, number, number]} pixel
 * @return {Uint8ClampedArray}
 */
export function drawPixelMutate(array, width, x, y, [r, g, b, a]) {
  const i = xyToIndex(width, x, y)

  array[i + 0] = r
  array[i + 1] = g
  array[i + 2] = b
  array[i + 3] = a

  return array
}

export const rectangle = (array, width, x1, y1, x2, y2, [r, g, b, a]) => {
  const cloned = arrayFrom(array)

  const startX = Math.min(x1, x2)
  const startY = Math.min(y1, y2)

  const endX = Math.max(x1, x2)
  const endY = Math.max(y1, y2)

  for (let y = startY; y <= endY; y += 1) {
    for (let x = startX; x <= endX; x += 1) {
      drawPixelMutate(cloned, width, x, y, [r, g, b, a])
    }
  }

  return cloned
}

export function line(array, width, x1, y1, x2, y2, [r, g, b, a]) {
  const cloned = arrayFrom(array)

  const dx = Math.abs(x2 - x1)
  const sx = x1 < x2 ? 1 : -1
  const dy = -Math.abs(y2 - y1)
  const sy = y1 < y2 ? 1 : -1

  let done
  let e2
  let er = dx + dy

  while (!done) {
    drawPixelMutate(cloned, width, x1, y1, [r, g, b, a])

    if (x1 === x2 && y1 === y2) {
      done = true
    } else {
      e2 = 2 * er
      if (e2 > dy) {
        er += dy
        x1 += sx
      }
      if (e2 < dx) {
        er += dx
        y1 += sy
      }
    }
  }

  return cloned
}

export function mapPixels(array, cb = x => x) {
  const length = array.length
  const cloned = arrayFrom(length)

  for (let i = 0; i < length; i += 4) {
    const [r = 0, g = 0, b = 0, a = 0] = cb(
      [
        array[i + 0], // r
        array[i + 1], // g
        array[i + 2], // b
        array[i + 3], // a
      ],
      i,
      array,
    )

    cloned[i + 0] = r
    cloned[i + 1] = g
    cloned[i + 2] = b
    cloned[i + 3] = a
  }

  return cloned
}

export function pixelCount(width, height) {
  return width * height
}

export function forEachPixel(array, cb) {
  const length = array.length

  for (let i = 0; i < length; i += 4) {
    cb(
      [
        array[i + 0], // r
        array[i + 1], // g
        array[i + 2], // b
        array[i + 3], // a
      ],
      i,
      array,
    )
  }
}

/**
 * @param baseArray
 * @param addArray
 * @param width
 * @param height
 * @param {{color: string, screen: string, exclusion: string, 'destination-out': string, saturation: string,
 *   'hard-light': string, 'soft-light': string, 'source-in': string, lighten: string, luminosity: string, xor: string,
 *   copy: string, multiply: string, 'destination-atop': string, overlay: string, 'destination-over': string, lighter:
 *   string, 'source-atop': string, 'destination-in': string, darken: string, 'color-burn': string, 'source-out':
 *   string, 'source-over': string, difference: string, hue: string, 'color-dodge': string}} blendMode
 */
export function composite(baseArray, addArray, width, height, blendMode) {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  // TODO: ctx.globalCompositeOperation = blendMode;
  //
  // blendModes:
  // - source-over
  // - source-in
  // - source-out
  // - source-atop
  // - destination-over
  // - destination-in
  // - destination-out
  // - destination-atop
  // - lighter
  // - copy
  // - xor
  // - multiply
  // - screen
  // - overlay
  // - darken
  // - lighten
  // - color-dodge
  // - color-burn
  // - hard-light
  // - soft-light
  // - difference
  // - exclusion
  // - hue
  // - saturation
  // - color
  // - luminosity

  const baseImageData = new ImageData(baseArray, width, height)
  const addImageData = new ImageData(addArray, width, height)

  ctx.putImageData(baseImageData, 0, 0)
  ctx.putImageData(addImageData, 0, 0)

  const { data } = ctx.getImageData(0, 0, width, height)

  return data
}

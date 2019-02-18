import { inRange } from '../utils.js'

export default class GameRoom {
  constructor(width = 800, height = 600) {
    this.width = width
    this.height = height
    this.objects = []

    this.init = this.init.bind(this)

    this.instanceCreate = this.instanceCreate.bind(this)
    this.instanceCount = this.instanceCount.bind(this)
    this.instanceDestroy = this.instanceDestroy.bind(this)

    this.setBackgroundColor = this.setBackgroundColor.bind(this)
    this.setBackgroundMusic = this.setBackgroundMusic.bind(this)
    this.setBackgroundImage = this.setBackgroundImage.bind(this)

    this.draw = this.draw.bind(this)
  }

  init() {
    this.initialized = true
  }

  /** @param {GameObject} object */
  instanceCount(object) {
    return !object
      ? this.objects.length
      : this.objects.filter(o => o.displayName === object.displayName).length
  }

  /**
   * @param {number} paddingTop - Percentage (0 - 1) or number of pixels.
   * @param {number} paddingBottom - Percentage (0 - 1) or number of pixels.
   * @param {number} paddingLeft - Percentage (0 - 1) or number of pixels.
   * @param {number} paddingRight - Percentage (0 - 1) or number of pixels.
   * @returns {{x: number, y: number}}
   */
  randomPosition({
    paddingTop = 0,
    paddingBottom = 0,
    paddingLeft = 0,
    paddingRight = 0,
  } = {}) {
    const distanceLeft = inRange(paddingLeft, 1)
      ? this.width * paddingLeft
      : paddingLeft
    const distanceRight = inRange(paddingRight, 1)
      ? this.width * paddingRight
      : paddingRight
    const distanceTop = inRange(paddingTop, 1)
      ? this.height * paddingTop
      : paddingTop
    const distanceBottom = inRange(paddingBottom, 1)
      ? this.height * paddingBottom
      : paddingBottom

    const horizontalSpace = this.width - distanceLeft - distanceRight
    const verticalSpace = this.height - distanceTop - distanceBottom

    // TODO: avoid solid objects
    return {
      x: distanceLeft + horizontalSpace * Math.random(),
      y: distanceTop + verticalSpace * Math.random(),
    }
  }

  /** @param {GameObject} object */
  instanceExists(object) {
    return this.objects.some(o => {
      return o.displayName === object.displayName
    })
  }

  /**
   * @param {number} x
   * @param {number} y
   * @param {GameObject} Constructor
   */
  instanceCreate(Constructor, x = this.width / 2, y = this.height / 2) {
    const object = new Constructor({ x, y })

    this.objects.push(object)
  }

  /** @param {GameObject} object */
  instanceDestroy(object) {
    const index = this.objects.findIndex(o => o === object)

    this.objects.splice(index, 1)
  }

  /** @param cssColor {string} */
  setBackgroundColor(cssColor) {
    this.backgroundColor = cssColor
  }

  /** @param image {GameImage} */
  setBackgroundImage(image) {
    this.backgroundImage = image
  }

  /** @param audio {GameAudio} */
  setBackgroundMusic(audio) {
    audio.loop = true
    audio.volume = 0.25
    this.backgroundMusic = audio
  }

  // This is separated from draw() so that if you override the draw() method
  // in a subclass, you can easily draw the default room contents.  Otherwise,
  // the subclass needs to duplicate this logic.
  drawDefault(drawing) {
    if (this.backgroundColor) {
      drawing.fill(this.backgroundColor)
    }

    if (this.backgroundImage) {
      drawing.image(this.backgroundImage)
    }
  }

  draw(drawing) {
    this.drawDefault(drawing)
  }
}

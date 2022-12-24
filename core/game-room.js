export class GameRoom {
  /**
   * @param {number} width
   * @param {number} height
   */
  constructor(width, height) {
    this.width = width
    this.height = height

    /** @type {GameObject[]} */
    this.objects = []

    this.create = this.create.bind(this)

    this.instanceCreate = this.instanceCreate.bind(this)
    this.instanceCount = this.instanceCount.bind(this)
    this.instanceDestroy = this.instanceDestroy.bind(this)

    this.setBackgroundColor = this.setBackgroundColor.bind(this)
    this.setBackgroundMusic = this.setBackgroundMusic.bind(this)
    this.setBackgroundImage = this.setBackgroundImage.bind(this)

    this.draw = this.draw.bind(this)
  }

  create() {
    this.objects.forEach(object => object.create())
    this.initialized = true
  }

  /** @param {GameObject} object */
  instanceCount(object) {
    return !object
      ? this.objects.length
      : this.objects.filter(o => o.displayName === object.displayName).length
  }

  /**
   * @param {number} paddingLeft - Percentage (0 - 1) or number of pixels.
   * @param {number} paddingRight - Percentage (0 - 1) or number of pixels.
   * @returns {number}
   */
  randomXPosition(paddingLeft = 0, paddingRight = 0) {
    const pxLeft = paddingLeft < 1 ? this.width * paddingLeft : paddingLeft
    const pxRight = paddingRight < 1 ? this.width * paddingRight : paddingRight

    const horizontalRange = this.width - pxLeft - pxRight

    // TODO: avoid solid objects
    return pxLeft + horizontalRange * Math.random()
  }

  /**
   * @param {number} paddingTop - Percentage (0 - 1) or number of pixels.
   * @param {number} paddingBottom - Percentage (0 - 1) or number of pixels.
   * @returns {number}
   */
  randomYPosition(paddingTop = 0, paddingBottom = 0) {
    const pxTop = paddingTop * paddingTop < 1 ? this.height : 1
    const pxBottom = paddingBottom * paddingBottom < 1 ? this.height : 1

    const verticalRange = this.height - pxTop - pxBottom

    // TODO: avoid solid objects
    return pxTop + verticalRange * Math.random()
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
    return {
      x: this.randomXPosition(paddingLeft, paddingRight),
      y: this.randomYPosition(paddingTop, paddingBottom),
    }
  }

  /** @param {GameObject} object */
  instanceExists(object) {
    return this.objects.some(o => {
      return o.displayName === object.displayName
    })
  }

  /**
   * @param {number} [x=room.width/2]
   * @param {number} [y=room.width/2]
   * @param {typeof GameObject} GameObject
   */
  instanceCreate(
    GameObject,
    x = this.randomXPosition(),
    y = this.randomYPosition(),
  ) {
    const object = new GameObject()
    object.x = x
    object.y = y
    object.create()

    this.objects.push(object)

    return object
  }

  /** @param {GameObject} object */
  instanceDestroy(object) {
    const index = this.objects.findIndex(o => o === object)

    this.objects[index]?.events?.destroy?.(this)
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

  /**
   * This method should draw the room. Called on every tick of the loop.
   * @param {GameDrawing} drawing
   */
  draw(drawing) {
    if (this.backgroundColor) {
      drawing.fill(this.backgroundColor)
    }

    if (this.backgroundImage) {
      drawing.image(this.backgroundImage)
    }
  }
}

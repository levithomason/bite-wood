import { random } from './math.js'

/**
 * @typedef {object} GameRoomConfig
 * @property {number} width
 * @property {number} height
 * @property {string|CanvasGradient|CanvasPattern} [backgroundColor]
 * @property {GameImage} [backgroundImage]
 * @property {GameAudio} [backgroundMusic]
 */

export class GameRoom {
  /**
   * @param {GameRoomConfig} config
   */
  constructor(config) {
    this.width = config.width
    this.height = config.height

    this.backgroundColor = config.backgroundColor
    this.backgroundImage = config.backgroundImage
    this.backgroundMusic = config.backgroundMusic

    this.objects = []

    this.create = this.create.bind(this)

    this.instanceCreate = this.instanceCreate.bind(this)
    this.instanceCount = this.instanceCount.bind(this)
    this.instanceDestroy = this.instanceDestroy.bind(this)

    this.draw = this.draw.bind(this)
  }

  create() {
    this.objects.forEach((object) => object.create())
    this.initialized = true
  }

  /** @param {GameObject} object */
  instanceCount(object) {
    return !object
      ? this.objects.length
      : this.objects.filter((o) => o.name === object.name).length
  }

  /**
   * @param {number} [paddingLeft=0] - Percentage (0 - 1) or number of pixels.
   * @param {number} [paddingRight=0] - Percentage (0 - 1) or number of pixels.
   * @returns {number}
   */
  randomXPosition(paddingLeft = 0, paddingRight = 0) {
    const pxLeft = paddingLeft * (paddingLeft < 1 ? this.width : 1)
    const pxRight = paddingRight * (paddingRight < 1 ? this.width : 1)

    const horizontalRange = this.width - pxLeft - pxRight

    return pxLeft + random(horizontalRange)
  }

  /**
   * @param {number} [paddingTop=0] - Percentage (0 - 1) or number of pixels.
   * @param {number} [paddingBottom=0] - Percentage (0 - 1) or number of pixels.
   * @returns {number}
   */
  randomYPosition(paddingTop = 0, paddingBottom = 0) {
    const pxTop = paddingTop * (paddingTop < 1 ? this.height : 1)
    const pxBottom = paddingBottom * (paddingBottom < 1 ? this.height : 1)

    const verticalRange = this.height - pxTop - pxBottom

    // TODO: avoid solid objects
    return pxTop + random(verticalRange)
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
    return this.objects.some((o) => {
      return o.name === object.name
    })
  }

  addObject(object) {
    this.objects.push(object)
    object.create()
  }

  /**
   * @param {number} [x=room.randomXPosition()]
   * @param {number} [y=room.randomYPosition()]
   * @param {typeof GameObject} GameObject
   * @param {object} [config={}] - Properties to set on the object.
   */
  instanceCreate(
    GameObject,
    x = this.randomXPosition(),
    y = this.randomYPosition(),
    config,
  ) {
    const object = new GameObject(config)
    object.x = x
    object.y = y

    this.objects.push(object)

    // Instances created during run-time need to have their create() event fired.
    // We do this AFTER the constructor and AFTER pushing it to the room objects so that
    // the object's event has access to the full state of the room (including itself).
    // The constructor instantiation time cannot provide for this.
    object.create()

    return object
  }

  /** @param {GameObject} object */
  instanceDestroy(object) {
    const index = this.objects.findIndex((o) => o === object)

    // TODO: get rid of events property and just use methods on the object.
    //       also use on* naming convention for events.
    object.destroy()
    this.objects[index]?.events?.destroy?.(this)
    this.objects.splice(index, 1)
  }

  /**
   * This method should draw the room. Called on every tick of the loop.
   * @param {GameDrawing} drawing
   */
  draw(drawing) {
    if (this.backgroundColor) {
      drawing.setFillColor(this.backgroundColor)
      drawing.rectangle(0, 0, this.width, this.height)
    }

    if (this.backgroundImage) {
      drawing.image(this.backgroundImage)
    }
  }
}

window.biteWood = window.biteWood || {}
window.biteWood.GameRoom = GameRoom

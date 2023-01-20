/**
 * @typedef {object} GameSpriteConfig
 * @property {number} [insertionX=0] - The distance from the left of the frame the image should be drawn.
 * @property {number} [insertionY=0] - The distance from the top of the frame the image should be drawn.
 * @property {number} [boundingBoxTop=0] - How many pixels into the top of the image an object can come before being
 * considered a collision.
 * @property {number} [boundingBoxLeft=0] - How many pixels into the left of the image an object can come before
 * being considered a collision.
 * @property {number} [boundingBoxWidth=frameWidth] - Width of the collision area starting from boundingBoxLeft.
 * @property {number} [boundingBoxHeight=frameHeight] - Height of the collision area starting from boundingBoxTop.
 * @property {number} [frameFirstY=0] - The relative Y position of the first frame in the sprite sheet.
 * @property {number} [frameFirstX=0] - The relative X position of the first frame in the sprite sheet.
 * @property {number} frameWidth - If this is a sprite strip, the width of a single frame in the strip.
 * @property {number} frameHeight - If this is a sprite strip, the width of a single frame in the strip.
 * @property {number} [frameCount=1] - The number of frames in the sprite total.
 * @property {number} [frameIndex=0] - Zero based index of the current sprite frame.
 * @property {number} [stepsPerFrame=1] - How many frames the sprite will cycle through per second.
 * @property {boolean} [rtl=false] - Set this to true if the frames in your sprite sheet progress from "right to left".
 * Useful for taking a "run left" sprite sheet and mirroring it to create a "run right". In this case, your frames would
 * progress from "right to left" as the original sprite sheet progressed from "left to right."
 * @property {number} [scaleX=1] - What scale
 * @property {number} [scaleY=1] - What scale
 */

import { GameImage } from './game-image.js'

/**
 * A GameSprite takes a GameImage and adds additional information to manage
 */
export class GameSprite {
  static instances = []

  /** @type {number} */
  #insertionX

  /** @type {number} */
  #insertionY

  /** @type {number} */
  #stepsThisFrame

  /** @type number */
  #boundingBoxTop
  /** @type number */
  #boundingBoxLeft
  /** @type number */
  #boundingBoxWidth
  /** @type number */
  #boundingBoxHeight

  /**
   * @param {GameImage} image - A GameImage instance.
   * @param {GameSpriteConfig} config
   */
  constructor(image, config) {
    const {
      insertionX = 0,
      insertionY = 0,
      frameFirstY = 0,
      frameFirstX = 0,
      frameWidth,
      frameHeight,
      frameCount = 1,
      rtl = false,
      frameIndex = 0,
      boundingBoxTop = 0,
      boundingBoxLeft = 0,
      boundingBoxWidth = frameWidth,
      boundingBoxHeight = frameHeight,
      stepsPerFrame = 1,
      scaleX = 1,
      scaleY = 1,
    } = config

    if (rtl) {
      const canvas = document.createElement('canvas')
      canvas.width = image.width
      canvas.height = image.height
      const ctx = canvas.getContext('2d')

      // center the image before flip
      ctx.translate(image.width, 0)
      // flip horizontally
      ctx.scale(-1, 1)
      // draw the image
      ctx.drawImage(image.element, 0, 0)

      // write this flipped canvas as the new image
      this.image = new GameImage(canvas.toDataURL())
    } else {
      this.image = image
    }
    this.#insertionX = insertionX
    this.#insertionY = insertionY
    this.#boundingBoxTop = boundingBoxTop
    this.#boundingBoxLeft = boundingBoxLeft
    this.#boundingBoxWidth = boundingBoxWidth
    this.#boundingBoxHeight = boundingBoxHeight
    this.frameFirstY = frameFirstY
    this.frameFirstX = frameFirstX
    this.frameWidth = frameWidth
    this.frameHeight = frameHeight
    this.frameCount = frameCount
    this.rtl = rtl
    this.frameIndex = rtl ? frameCount - 1 : frameIndex
    this.stepsPerFrame = stepsPerFrame
    this.scaleX = scaleX
    this.scaleY = scaleY

    this.#stepsThisFrame = 0
    this.step = this.step.bind(this)

    GameSprite.instances.push(this)
  }

  /**
   * The scaled width of the sprite.
   * @type {number}
   */
  get width() {
    return this.frameWidth * this.scaleX
  }

  /**
   * The scaled height of the sprite.
   * @type {number}
   */
  get height() {
    return this.frameHeight * this.scaleY
  }

  /**
   * The scaled insertionX of the sprite.
   * @type {number}
   */
  get insertionX() {
    return this.#insertionX * this.scaleX
  }

  /**
   * The scaled insertionY of the sprite.
   * @type {number}
   */
  get insertionY() {
    return this.#insertionY * this.scaleY
  }

  /**
   * Relative x position of the current frame in the sprite sheet.
   * The current frame is determined by the frame index.
   * This value flips with rtl.
   * @return {number}
   */
  get currentFrameX() {
    return this.getFrameXAtIndex(this.frameIndex)
  }

  /**
   * Relative y position of the current frame in the sprite sheet.
   * This is always firstFrameY and exists mostly for parity with frameFirstX.
   * @return {number}
   */
  get currentFrameY() {
    return this.frameFirstY
  }

  /**
   * Returns the x position in the sprite sheet for the frame at the specified frame index.
   * @param {number} index
   * @return {number}
   */
  getFrameXAtIndex(index) {
    if (this.rtl) {
      return (
        this.image.width -
        this.frameFirstX -
        index * this.frameWidth -
        // we need to move 1 more frame to the left when going in reverse
        // because x starts on the left of the frame
        this.frameWidth
      )
    }

    return this.frameFirstX + index * this.frameWidth
  }

  /**
   * When rtl is false (default) the direction is 1, or forward.
   * When rtl is true (reverse) the direction is -1.
   * @return {number}
   */
  get direction() {
    return this.rtl ? -1 : 1
  }

  get boundingBoxTop() {
    return this.#boundingBoxTop * this.scaleY
  }
  get boundingBoxLeft() {
    const left = this.#boundingBoxLeft * this.scaleX

    if (this.rtl) {
      return this.width - left - this.#boundingBoxWidth * this.scaleX
    }

    return left
  }
  get boundingBoxRight() {
    return this.boundingBoxLeft + this.#boundingBoxWidth * this.scaleX
  }
  get boundingBoxBottom() {
    return this.boundingBoxTop + this.#boundingBoxHeight * this.scaleY
  }
  get boundingBoxWidth() {
    return Math.abs(this.boundingBoxRight - this.boundingBoxLeft)
  }

  get boundingBoxHeight() {
    return Math.abs(this.boundingBoxBottom - this.boundingBoxTop)
  }

  step() {
    this.#stepsThisFrame++

    if (this.#stepsThisFrame >= this.stepsPerFrame) {
      this.#stepsThisFrame = 0
      this.frameIndex = (this.frameIndex + 1) % this.frameCount
    }
  }

  /**
   * Draws the current frame
   * @param {GameDrawing} drawing
   * @param {number} x
   * @param {number} y
   */
  draw(drawing, x, y) {
    // TODO: Consider moving gameDrawing logic here for drawing.
    //       Would allow drawing a sprite without assigning it first to an object.
    //       Useful for things like sprite-debug where we didn't really need an object.
    //       Consider what pattern we want.
  }
}

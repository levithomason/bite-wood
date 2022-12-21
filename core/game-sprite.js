/**
 * A GameSprite takes a GameImage and adds additional information to manage
 * scale, insertion point, offset, bounding box, and animating frames.
 */
export class GameSprite {
  /**
   * @param options
   * @param {GameImage} options.image - A GameImage instance.
   * @param {number} options.scaleX=1 - What scale
   * @param {number} options.scaleY=1 - What scale
   * @param {number} options.insertionX - The distance along the X axis the image should be drawn from the top left.
   * @param {number} options.insertionY - The distance along the Y axis the image should be drawn from the top left.
   * @param {number} options.offsetX
   * @param {number} options.offsetY
   * @param {number} options.boundingBoxTop - How many pixels into the top of the image an object can come before being
   * considered a collision.
   * @param {number} options.boundingBoxLeft - How many pixels into the left of the image an object can come before
   * being considered a collision.
   * @param {number} options.boundingBoxWidth - How wide the collision box starting from boundingBoxLeft.
   * @param {number} options.boundingBoxHeight - How tall the collision box starting from boundingBoxTop.
   * @param {number} options.frameWidth - If this is a sprite strip, the width of a single frame in the strip.
   * @param {number} options.frameHeight - If this is a sprite strip, the width of a single frame in the strip.
   * @param {number} options.frameCount - The number of frames in the sprite total.
   * @param {number} options.frameIndex - Zero based index of the current sprite frame.
   * @param {number} options.stepsPerFrame - Effectively the animation speed. How many game steps should take place
   * before incrementing to the next sprite frame.
   * @param {boolean} options.rtl - "Right to left" defines whether this sprite should be drawn right to left, opposed
   * to left to right. This results in reversing the frames and mirroring the images. Useful for taking a "run left"
   * sprite and creating a "run right", for example.
   */
  constructor({
    image,
    scaleX = 1,
    scaleY = 1,
    insertionX = 0,
    insertionY = 0,
    offsetX = 0,
    offsetY = 0,
    boundingBoxTop = 0,
    boundingBoxLeft = 0,
    boundingBoxWidth,
    boundingBoxHeight,
    frameWidth,
    frameHeight,
    frameCount = 1,
    frameIndex = 0,
    stepsPerFrame = 1,
    rtl = false,
  }) {
    this.image = image
    this.scaleX = scaleX
    this.scaleY = scaleY
    this.insertionX = insertionX
    this.insertionY = insertionY
    this.offsetX = offsetX
    this.offsetY = offsetY
    this.boundingBoxTop = boundingBoxTop
    this.boundingBoxLeft = boundingBoxLeft
    this.boundingBoxHeight =
      typeof boundingBoxHeight === 'undefined' ? frameHeight : boundingBoxHeight
    this.boundingBoxWidth =
      typeof boundingBoxWidth === 'undefined' ? frameWidth : boundingBoxWidth
    this.frameWidth = frameWidth
    this.frameHeight = frameHeight
    this.frameCount = frameCount
    this.frameIndex = frameIndex
    this.stepsPerFrame = stepsPerFrame
    this.rtl = rtl

    this.stepsThisFrame = 0
    this.step = this.step.bind(this)
  }

  step() {
    this.stepsThisFrame++

    if (this.stepsThisFrame >= this.stepsPerFrame) {
      this.stepsThisFrame = 0
      this.frameIndex = (this.frameIndex + 1) % this.frameCount
    }
  }
}

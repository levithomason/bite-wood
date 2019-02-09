export default class GameSprite {
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

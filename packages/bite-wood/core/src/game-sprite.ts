import { GameImage } from './game-image.js'

export interface GameSpriteConfig {
  /** The distance from the left of the frame the image should be drawn. */
  insertionX?: GameSprite['insertionX']

  /** The distance from the top of the frame the image should be drawn. */
  insertionY?: GameSprite['insertionY']

  /** How many pixels into the top of the image an object can come before being considered a collision. */
  boundingBoxTop?: GameSprite['boundingBoxTop']

  /** How many pixels into the left of the image an object can come before being considered a collision. */
  boundingBoxLeft?: GameSprite['boundingBoxLeft']

  /** Width of the collision area starting from boundingBoxLeft. */
  boundingBoxWidth?: GameSprite['boundingBoxWidth']

  /** Height of the collision area starting from boundingBoxTop. */
  boundingBoxHeight?: GameSprite['boundingBoxHeight']

  /** The relative Y position of the first frame in the sprite sheet. */
  frameFirstX?: GameSprite['frameFirstX']

  /** The relative X position of the first frame in the sprite sheet. */
  frameFirstY?: GameSprite['frameFirstY']

  /** If this is a sprite strip, the width of a single frame in the strip. */
  frameWidth: GameSprite['frameWidth']

  /** If this is a sprite strip, the width of a single frame in the strip. */
  frameHeight: GameSprite['frameHeight']

  /** The number of frames in the sprite total. */
  frameCount?: GameSprite['frameCount']

  /** Zero based index of the current sprite frame. */
  frameIndex?: GameSprite['frameIndex']

  /** How many frames the sprite will cycle through per second. */
  stepsPerFrame?: GameSprite['stepsPerFrame']

  /** Scales the sprite along the X axis, including the bounding box and insertion point. */
  scaleX?: GameSprite['scaleX']

  /** Scales the sprite along the Y axis, including the bounding box and insertion point. */
  scaleY?: GameSprite['scaleY']
}

/**
 * A GameSprite takes a GameImage and adds additional information to manage
 */
export class GameSprite {
  image: GameImage
  stepsThisFrame: number

  /**
   * Is true when the sprite is mirrored.
   * See cloneRTL() for creating a mirrored sprite.
   */
  #rtl?: boolean

  /** The distance from the left of the frame the image should be drawn. */
  #insertionX: number

  /** The distance from the top of the frame the image should be drawn. */
  #insertionY: number

  /** How many pixels into the top of the image an object can come before being considered a collision. */
  #boundingBoxTop: number

  /** How many pixels into the left of the image an object can come before being considered a collision. */
  #boundingBoxLeft: number

  /** Width of the collision area starting from boundingBoxLeft. */
  #boundingBoxWidth: number

  /** Height of the collision area starting from boundingBoxTop. */
  #boundingBoxHeight: number

  /** The relative Y position of the first frame in the sprite sheet. */
  frameFirstX: number

  /** The relative X position of the first frame in the sprite sheet. */
  frameFirstY: number

  /** If this is a sprite strip, the width of a single frame in the strip. */
  frameWidth: number

  /** If this is a sprite strip, the width of a single frame in the strip. */
  frameHeight: number

  /** The number of frames in the sprite total. */
  frameCount: number

  /** Zero based index of the current sprite frame. */
  frameIndex: number

  /** How many frames the sprite will cycle through per second. */
  stepsPerFrame: number

  /** Scales the sprite along the X axis, including the bounding box and insertion point. */
  scaleX: number

  /** Scales the sprite along the Y axis, including the bounding box and insertion point. */
  scaleY: number

  /**
   * @param image - A GameImage instance.
   * @param config
   */
  constructor(image: GameImage, config: GameSpriteConfig) {
    const {
      insertionX = 0,
      insertionY = 0,
      frameFirstY = 0,
      frameFirstX = 0,
      frameWidth,
      frameHeight,
      frameCount = 1,
      frameIndex = 0,
      boundingBoxTop = 0,
      boundingBoxLeft = 0,
      boundingBoxWidth = frameWidth,
      boundingBoxHeight = frameHeight,
      stepsPerFrame = 1,
      scaleX = 1,
      scaleY = 1,
    } = config

    this.image = image

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
    this.#rtl = false
    this.frameIndex = frameIndex
    this.stepsPerFrame = stepsPerFrame
    this.scaleX = scaleX
    this.scaleY = scaleY

    this.stepsThisFrame = 0
    this.step = this.step.bind(this)
  }

  /**
   * Creates a new sprite that is a mirror image of the provided sprite.
   * Useful for taking a "run left" sprite sheet and mirroring it to create a "run right".
   * In this case, your frames would progress from "right to left" as the original sprite
   * sheet progressed from "left to right."
   */
  async cloneRTL(): Promise<GameSprite> {
    const canvas = document.createElement('canvas')
    canvas.width = this.image.width
    canvas.height = this.image.height

    const ctx = canvas.getContext('2d')
    if (!ctx) {
      // can be null
      throw new Error('Could not get 2d context from canvas')
    }

    // center the image before flip
    ctx.translate(this.image.width, 0)
    // flip horizontally
    ctx.scale(-1, 1)
    // draw the image
    ctx.drawImage(this.image.element, 0, 0)

    // write this flipped canvas as the new image
    const image = new GameImage(canvas.toDataURL())
    await image.load()

    return new GameSprite(image, {
      insertionX: this.#insertionX,
      insertionY: this.#insertionY,
      frameFirstY: this.frameFirstY,
      frameFirstX: this.frameFirstX,
      frameWidth: this.frameWidth,
      frameHeight: this.frameHeight,
      frameCount: this.frameCount,
      frameIndex: this.frameIndex,
      boundingBoxTop: this.#boundingBoxTop,
      boundingBoxLeft: this.#boundingBoxLeft,
      boundingBoxWidth: this.#boundingBoxWidth,
      boundingBoxHeight: this.#boundingBoxHeight,
      stepsPerFrame: this.stepsPerFrame,
      scaleX: this.scaleX,
      scaleY: this.scaleY,
    })
  }

  /** The scaled width of the sprite. */
  get width() {
    return this.frameWidth * this.scaleX
  }

  /** The scaled height of the sprite. */
  get height() {
    return this.frameHeight * this.scaleY
  }

  /** The scaled insertionX of the sprite. */
  get insertionX() {
    return this.#insertionX * this.scaleX
  }

  /** The scaled insertionY of the sprite. */
  get insertionY() {
    return this.#insertionY * this.scaleY
  }

  /**
   * Relative x position of the current frame in the sprite sheet.
   * The current frame is determined by the frame index.
   * This value flips with rtl.
   */
  get currentFrameX(): number {
    return this.getFrameXAtIndex(this.frameIndex)
  }

  /**
   * Relative y position of the current frame in the sprite sheet.
   * This is always firstFrameY and exists mostly for parity with frameFirstX.
   */
  get currentFrameY(): number {
    return this.frameFirstY
  }

  /**
   * Returns the x position in the sprite sheet for the frame at the specified frame index.
   */
  getFrameXAtIndex(index: number): number {
    if (this.#rtl) {
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
   */
  get direction(): number {
    return this.#rtl ? -1 : 1
  }

  get boundingBoxTop() {
    return this.#boundingBoxTop * this.scaleY
  }
  get boundingBoxLeft() {
    const left = this.#boundingBoxLeft * this.scaleX

    if (this.#rtl) {
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
    this.stepsThisFrame++

    if (this.stepsThisFrame >= this.stepsPerFrame) {
      this.stepsThisFrame = 0
      this.frameIndex = (this.frameIndex + 1) % this.frameCount
    }
  }

  /**
   * Draws the current frame
   * @param drawing
   * @param x
   * @param y
   */
  draw(drawing: any, x: number, y: number) {
    // TODO: Consider moving gameDrawing logic here for drawing.
    //       Would allow drawing a sprite without assigning it first to an object.
    //       Useful for things like sprite-debug where we didn't really need an object.
    //       Consider what pattern we want.
  }
}

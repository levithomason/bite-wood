import { gameKeyboard } from './game-keyboard-controller.js'
import { gameMouse } from './game-mouse-controller.js'
import { gamePhysics } from './game-physics-controller.js'
import { gameState } from './game-state-controller.js'
import { offsetX, offsetY, Vector } from './math.js'
import { gameRooms } from './game-rooms.js'

/**
 * @typedef {'static'|'dynamic'} GameObjectCollider
 */

/**
 * @typedef {Object} GameObjectConfig
 * @property {number} [boundingBoxTop=0] - The bounding box's distance away from the object's y position.
 * @property {number} [boundingBoxLeft=0] - The bounding box's distance away from the object's x position.
 * @property {number} [boundingBoxWidth=0] - How wide the bounding box starting from boundingBoxLeft.
 * @property {number} [boundingBoxHeight=0] - How tall the bounding box starting from boundingBoxTop.
 * @property {boolean} [persist=false] - Determines whether this object should still exist when the room changes.
 * @property {GameSprite|undefined} [sprite]
 * @property {GameObjectCollider} [collider='dynamic']
 * @property {number} [x=0]
 * @property {number} [y=0]
 * @property {number} [acceleration=0]
 * @property {Vector} [gravity=gamePhysics.gravity]
 * @property {number} [friction=gamePhysics.friction]
 * @property {number} [speed=0]
 * @property {number} [direction=0]
 * @property {GameObjectEvents} [events={}]
 * @property {...object} ...properties
 */

/**
 * @typedef {function} GameObjectAction
 * @param {GameObject} self
 */

/**
 * @typedef {function} GameDrawingAction
 * @param {GameDrawing} self
 */

/**
 * @typedef {object} GameObjectEvents
 * @property {GameObjectAction} [create]
 * @property {GameObjectAction} [destroy]
 * @property {GameObjectAction} [create]
 * @property {GameDrawingAction} [draw]
 * @property {GameObjectAction} [keyActive]
 * @property {GameObjectAction} [keyDown]
 * @property {GameObjectAction} [keyUp]
 * @property {GameObjectAction} [mouseActive]
 * @property {GameObjectAction} [mouseDown]
 * @property {GameObjectAction} [mouseUp]
 * @property {GameObjectAction} [step]
 */

export class GameObject {
  /** @type {number} */
  #boundingBoxWidth
  /** @type {number} */
  #boundingBoxHeight
  /** @type {number} */
  #boundingBoxLeft
  /** @type {number} */
  #boundingBoxTop

  /** @type {Vector} */
  #vector

  /**
   * An array of all instantiated game objects.
   * @type {GameObject[]}
   */
  static instances = []

  // TODO: introduce object ids, replace instance equality checks
  // id = uuidv4()

  /**
   * @param {GameObjectConfig} [config]
   */
  constructor(config = {}) {
    const {
      boundingBoxTop = 0,
      boundingBoxLeft = 0,
      boundingBoxWidth = 0,
      boundingBoxHeight = 0,
      persist = false,
      sprite,
      x = 0,
      y = 0,
      acceleration = 0,
      collider = 'dynamic',
      gravity = gamePhysics.gravity,
      friction = gamePhysics.friction,
      speed = 0,
      direction = 0,
      events = {},
      ...properties
    } = config

    this.#boundingBoxTop = boundingBoxTop
    this.#boundingBoxLeft = boundingBoxLeft
    this.#boundingBoxWidth = boundingBoxWidth
    this.#boundingBoxHeight = boundingBoxHeight

    this.collider = collider
    this.persist = persist
    this.sprite = sprite
    this.x = x
    this.y = y
    this.acceleration = acceleration
    this.friction = friction
    this.gravity = gravity
    this.#vector = new Vector(
      offsetX(this.x, speed, direction),
      offsetY(this.y, speed, direction),
    )
    this.events = events

    // assign any custom properties the developer passed in
    Object.keys(properties).forEach((property) => {
      if (property in this) {
        const message = `Cannot create ${this.name} with property ${property} because it is already defined by GameObject.`
        throw new Error(message)
      }
      this[property] = properties[property]
    })

    this.create = this.create.bind(this)
    this.moveTo = this.moveTo.bind(this)
    this.move = this.move.bind(this)
    this.motionAdd = this.motionAdd.bind(this)
    this.setSprite = this.setSprite.bind(this)
    this.step = this.step.bind(this)
    this.draw = this.draw.bind(this)

    GameObject.instances.push(this)
  }

  get name() {
    return this.constructor.name
  }

  get speed() {
    return this.#vector.magnitude
  }

  set speed(speed) {
    this.#vector.magnitude = speed
  }

  get hspeed() {
    return this.#vector.x
  }

  set hspeed(hspeed) {
    this.#vector.x = hspeed
  }

  get vspeed() {
    return this.#vector.y
  }

  set vspeed(vspeed) {
    this.#vector.y = vspeed
  }

  get direction() {
    return this.#vector.direction
  }

  set direction(direction) {
    this.#vector.direction = direction
  }

  get boundingBoxTop() {
    if (this.sprite) {
      return this.y - this.sprite.insertionY + this.sprite.boundingBoxTop
    }

    return this.y + this.#boundingBoxTop
  }

  set boundingBoxTop(val) {
    this.#boundingBoxTop = val
  }

  get boundingBoxLeft() {
    if (this.sprite) {
      return this.x - this.sprite.insertionX + this.sprite.boundingBoxLeft
    }

    return this.x + this.#boundingBoxLeft
  }

  set boundingBoxLeft(val) {
    this.#boundingBoxLeft = val
  }

  get boundingBoxRight() {
    if (this.sprite) {
      return this.boundingBoxLeft + this.sprite.boundingBoxWidth
    }

    return this.boundingBoxLeft + this.#boundingBoxWidth
  }

  get boundingBoxBottom() {
    if (this.sprite) {
      return this.boundingBoxTop + this.sprite.boundingBoxHeight
    }

    return this.boundingBoxTop + this.#boundingBoxHeight
  }

  get boundingBoxWidth() {
    return Math.abs(this.boundingBoxRight - this.boundingBoxLeft)
  }

  set boundingBoxWidth(val) {
    this.#boundingBoxWidth = val
  }

  get boundingBoxHeight() {
    return Math.abs(this.boundingBoxBottom - this.boundingBoxTop)
  }

  set boundingBoxHeight(val) {
    this.#boundingBoxHeight = val
  }

  /**
   * The x offset of the object's insertion point relative to the top left corner of the bounding box.
   * @return {number}
   */
  get insertionX() {
    if (this.sprite) return this.sprite.insertionX
    return -this.#boundingBoxLeft
  }

  /**
   * The y offset of the object's insertion point relative to the top left corner of the bounding box.
   * @return {number}
   */
  get insertionY() {
    if (this.sprite) return this.sprite.insertionY
    return -this.#boundingBoxTop
  }

  /**
   * This is the current sprite's top position in the room.
   * Returns 0 if there is no sprite.
   * @return {number}
   */
  get spriteTop() {
    if (!this.sprite) return 0
    return this.y - this.sprite.insertionY
  }
  /**
   * This is the current sprite's left position in the room.
   * Returns 0 if there is no sprite.
   * @return {number}
   */
  get spriteLeft() {
    if (!this.sprite) return 0
    return this.x - this.sprite.insertionX
  }
  /**
   * This is the current sprite's right position in the room.
   * Returns 0 if there is no sprite.
   * @return {number}
   */
  get spriteRight() {
    if (!this.sprite) return 0
    return this.spriteLeft + this.sprite.width
  }
  /**
   * This is the current sprite's bottom position in the room.
   * Returns 0 if there is no sprite.
   * @return {number}
   */
  get spriteBottom() {
    if (!this.sprite) return 0
    return this.spriteTop + this.sprite.height
  }

  // events

  /**
   * Called when this object has registered a collision.
   * @param {GameObject} other
   */
  onCollision(other) {}

  /**
   * Called when the object is created in the room.
   */
  create() {
    // TODO: set xStart and yStart here
    this.events?.create?.(this)
  }

  destroy() {
    this.events?.destroy?.(this)

    const index = GameObject.instances.indexOf(this)
    GameObject.instances.splice(index, 1)
  }

  moveTo(x, y) {
    // TODO: Make get/set for x,y (#x,#y) and track xPrev, yPrev
    //       This is not the same as applying the vector in reverse, since,
    //       it is possible to update the vector then check xPrev, yPrev and get
    //       the wrong values. We want real world last x,y
    this.x = x
    this.y = y
  }

  move(direction, distance) {
    this.x = offsetX(this.x, distance, direction)
    this.y = offsetY(this.y, distance, direction)
  }

  motionAdd(direction, speed) {
    this.#vector.add(direction, speed)
  }

  setSprite(sprite) {
    if (sprite === this.sprite) return

    this.sprite = sprite
    this.sprite.frameIndex = 0
    this.sprite.stepsThisFrame = 0
  }

  /**
   * This method should apply changes to the object's state.
   * Do not draw in this method. Called on every tick of the loop.
   */
  step() {
    //
    // Invoke Events
    //

    // keyDown
    if (this.events.keyDown) {
      Object.keys(gameKeyboard.down).forEach((key) => {
        this.events.keyDown[key]?.(this)
      })
    }

    // keyActive
    if (this.events.keyActive) {
      Object.keys(gameKeyboard.active).forEach((key) => {
        this.events.keyActive[key]?.(this)
      })
    }

    // keyUp
    if (this.events.keyUp) {
      Object.keys(gameKeyboard.up).forEach((key) => {
        this.events.keyUp[key]?.(this)
      })
    }

    // mouseDown
    if (this.events.mouseDown) {
      Object.keys(gameMouse.down).forEach((key) => {
        this.events.mouseDown[key]?.(this)
      })
    }

    // mouseActive
    if (this.events.mouseActive) {
      Object.keys(gameMouse.active).forEach((button) => {
        this.events.mouseActive[button]?.(this)
      })
    }

    // mouseUp
    if (this.events.mouseUp) {
      Object.keys(gameMouse.up).forEach((button) => {
        this.events.mouseUp[button]?.(this)
      })
    }

    // step
    this.events.step?.(this)

    //
    // Sprite
    // The sprite contains the bounding box and needs to step before the physics.
    //
    if (this.sprite && this.sprite.step) {
      this.sprite.step()
    }

    //
    // Physics
    //

    //
    // Movement
    //

    // apply final calculated movement values
    this.move(this.direction, this.speed)
  }

  /**
   * This method should draw the object. Called on every tick of the loop.
   * @param {GameDrawing} drawing
   */
  draw(drawing) {
    if (this.sprite) {
      drawing.sprite(this.sprite, this.x, this.y)
    }

    if (gameState.isPlaying) {
      this.events?.draw?.(drawing)
    }
  }

  /**
   * Draws a debug view of the object.
   * @param {GameDrawing} drawing
   */
  drawDebug(drawing) {
    const {
      name,
      sprite,
      state,
      x,
      y,
      hspeed,
      vspeed,
      speed,
      direction,
      gravity,
      friction,
      boundingBoxTop,
      boundingBoxLeft,
      boundingBoxWidth,
      boundingBoxHeight,
    } = this

    drawing.saveSettings()

    drawing.setLineWidth(1)
    drawing.setFillColor('transparent')

    // sprite frame
    if (this.sprite) {
      drawing.setStrokeColor('rgba(0, 0, 0, 0.2)')
      drawing.rectangle(
        this.spriteLeft,
        this.spriteTop,
        sprite.width,
        sprite.height,
      )
    }

    // bounding box
    if (this.hasCollision.onAnySide) {
      drawing.setStrokeColor('#F80')
    } else {
      drawing.setStrokeColor('#08F')
    }
    drawing.rectangle(
      boundingBoxLeft,
      boundingBoxTop,
      boundingBoxWidth,
      boundingBoxHeight,
    )

    // insertion point
    drawing.setStrokeColor('#F00')
    drawing.cross(x, y, 6, 6)

    // vector
    if (speed) {
      drawing.setStrokeColor('#0D0')
      drawing.arrow(x, y, x + hspeed * 4, y + vspeed * 4, 4)
    }

    // text values
    drawing.setFontSize(12)
    drawing.setFontFamily('monospace')
    drawing.setTextAlign('left')
    const fixed = (n) => n.toFixed(2)
    const lines = [
      `${name}`,
      // TODO: make state a required abstraction of game objects
      state && `state     ${state.name}`,
      `x         ${fixed(x)}`,
      `y         ${fixed(y)}`,
      `direction ${fixed(direction)}`,
      `speed     ${fixed(speed)} (${fixed(hspeed)}, ${fixed(vspeed)})`,
      gravity && `gravity   ${fixed(gravity.magnitude)}`,
      friction && `friction  ${fixed(friction)}`,
    ].filter(Boolean)
    lines.reverse().forEach((line, i) => {
      const x = this.spriteLeft
      const y = this.spriteTop - (i + 1) * 14
      drawing.setFillColor('#000')
      drawing.text(line, x, y)
    })
    drawing.loadSettings()
  }

  // TODO: this (like step collision check) needs bounding box apart from the sprite
  //       see step physics regarding staying outside solid objects
  isOutsideRoom() {
    return (
      this.x < 0 ||
      this.y < 0 ||
      this.x > gameRooms.currentRoom.width ||
      this.y > gameRooms.currentRoom.height
    )
  }

  /**
   * Keep the object in the room.
   * Optionally `bounce` off the walls and define `padding` to keep away from the edges.
   *
   * @param {number} [bounce=0] - How much to bounce when hitting the walls. 0 = stop, 1 = full bounce.
   * @param {object} [padding={}] - Number of pixels to keep away from the top of the room.
   * @param {number} [padding.top=0] - Number of pixels to keep away from the top of the room.
   * @param {number} [padding.right=0] - Number of pixels to keep away from the right of the room.
   * @param {number} [padding.bottom=0] - Number of pixels to keep away from the bottom of the room.
   * @param {number} [padding.left=0] - Number of pixels to keep away from the left of the room.
   *
   * @example
   * // Bounce off the walls with 100% of the original speed
   * this.bounceOffRoom(1)
   * @example
   * // Bounce off the walls with 50% of the original speed
   * this.bounceOffRoom(0.5)
   * @example
   * // Stop when hitting walls, 0% of the original speed.
   * this.bounceOffRoom(0)
   * this.bounceOffRoom()
   * @example
   * // Stop at the walls, but keep 50px away from the bottom.
   * this.bounceOffRoom(0, { bottom: 50 })
   */
  keepInRoom(bounce = 0, padding = {}) {
    const { top = 0, right = 0, bottom = 0, left = 0 } = padding
    const room = gameRooms.currentRoom

    // TODO: objects are getting stuck on the edges of the room

    // outside left
    if (this.boundingBoxLeft < left) {
      this.hspeed = Math.abs(this.hspeed) * bounce
      this.x = left + this.insertionX
    }
    // outside right
    else if (this.boundingBoxRight > room.width - right) {
      this.hspeed = -Math.abs(this.hspeed) * bounce
      this.x = room.width - right - this.boundingBoxWidth + this.insertionX
    }

    // outside top
    if (this.boundingBoxTop < top) {
      this.vspeed = Math.abs(this.vspeed) * bounce
      this.y = top + this.insertionY
    }
    // outside bottom
    else if (this.boundingBoxBottom > room.height - bottom) {
      this.vspeed = -Math.abs(this.vspeed) * bounce
      this.y = room.height - bottom - this.boundingBoxHeight + this.insertionY
    }
  }
}

window.biteWood = window.biteWood || {}
window.biteWood.GameObject = GameObject

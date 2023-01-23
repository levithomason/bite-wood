import { gameKeyboard } from './game-keyboard-controller.js'
import { gameMouse } from './game-mouse-controller.js'
import { gamePhysics } from './game-physics-controller.js'
import { gameState } from './game-state-controller.js'
import { Vector } from './math.js'
import { gameRooms } from './game-rooms.js'
import { gameDrawing } from './game-drawing-controller.js'

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
  /** @type number */
  #boundingBoxWidth
  /** @type number */
  #boundingBoxHeight
  /** @type number */
  #boundingBoxLeft
  /** @type number */
  #boundingBoxTop

  /**
   * An array of all instantiated game objects.
   * @type {GameObject[]}
   */
  static instances = []

  // TODO: introduce object ids, replace instance equality checks
  // id = uuidv4()

  /**
   * @param {object} [config]
   * @param {number} [config.boundingBoxTop=0] - The bounding box's distance away from the object's y position.
   * @param {number} [config.boundingBoxLeft=0] - The bounding box's distance away from the object's x position.
   * @param {number} [config.boundingBoxWidth=0] - How wide the bounding box starting from boundingBoxLeft.
   * @param {number} [config.boundingBoxHeight=0] - How tall the bounding box starting from boundingBoxTop.
   * @param {boolean} [config.persist=false] - Determines whether this object should still exist when the room changes.
   * @param {GameSprite|undefined} [config.sprite]
   * @param {boolean} [config.solid=false]
   * @param {number} [config.x=0]
   * @param {number} [config.y=0]
   * @param {number} [config.acceleration=0]
   * @param {Vector} [config.gravity=gamePhysics.gravity]
   * @param {number} [config.friction=gamePhysics.friction]
   * @param {number} [config.speed=0]
   * @param {number} [config.direction=0]
   * @param {GameObjectEvents} [config.events={}]
   * @param {...object} ...properties
   */
  constructor(config = {}) {
    const {
      boundingBoxTop = 0,
      boundingBoxLeft = 0,
      boundingBoxWidth = 0,
      boundingBoxHeight = 0,
      persist = false,
      sprite,
      solid = false,
      x = 0,
      y = 0,
      acceleration = 0,
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

    this.persist = persist
    this.sprite = sprite
    this.solid = solid
    this.x = x
    this.y = y
    this.acceleration = acceleration
    this.friction = friction
    this.gravity = gravity
    this._vector = new Vector(direction, speed)
    this.events = events

    // assign any custom properties the developer passed in
    Object.keys(properties).forEach((property) => {
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
    return this._vector.magnitude
  }

  set speed(speed) {
    this._vector.magnitude = speed
  }

  get hspeed() {
    return this._vector.x
  }

  set hspeed(hspeed) {
    this._vector.x = hspeed
  }

  get vspeed() {
    return this._vector.y
  }

  set vspeed(vspeed) {
    this._vector.y = vspeed
  }

  get direction() {
    return this._vector.direction
  }

  set direction(direction) {
    this._vector.direction = direction
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
   * This is the current sprite's top position in the room.
   * Returns 0 if there is no sprite
   * @return {number}
   */
  get spriteTop() {
    if (!this.sprite) return 0
    return this.y - this.sprite.insertionY
  }
  /**
   * This is the current sprite's left position in the room.
   * Returns 0 if there is no sprite
   * @return {number}
   */
  get spriteLeft() {
    if (!this.sprite) return 0
    return this.x - this.sprite.insertionX
  }
  /**
   * This is the current sprite's right position in the room.
   * Returns 0 if there is no sprite
   * @return {number}
   */
  get spriteRight() {
    if (!this.sprite) return 0
    return this.spriteLeft + this.sprite.width
  }
  /**
   * This is the current sprite's bottom position in the room.
   * Returns 0 if there is no sprite
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
    const newX = this.x + distance * Math.cos((direction * Math.PI) / 180)
    const newY = this.y + distance * Math.sin((direction * Math.PI) / 180)

    this.x = newX
    this.y = newY
  }

  motionAdd(direction, speed) {
    this._vector.add(direction, speed)
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

    if (gameState.debug) {
      gameDrawing.objectDebug(this)
    }
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
}

window.biteWood = window.biteWood || {}
window.biteWood.GameObject = GameObject

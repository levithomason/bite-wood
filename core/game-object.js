import { gameKeyboard } from './game-keyboard-controller.js'
import { gameMouse } from './game-mouse-controller.js'
import { gamePhysics } from './game-physics-controller.js'
import { gameState } from './game-state-controller.js'
import { Vector } from './math.js'
import { gameRooms } from './game-rooms.js'

/**
 * @typedef {function} GameObjectAction
 * @param {GameObject} self
 */

/**
 * @typedef {function} GameDrawingAction
 * @param {GameDrawing} self
 */

export class GameObject {
  /**
   * An array of all instantiated game objects.
   * @type {GameObject[]}
   */
  static instances = []

  /**
   * @param {GameSprite} sprite
   * @param {boolean} [persist=false] - Determines whether this object should still exist when the room changes.
   * @param {boolean} [solid=true]
   *
   * @param {number} [x=0]
   * @param {number} [y=0]
   * @param {number} [acceleration=0]
   * @param {Vector} [gravity=gamePhysics.gravity]
   * @param {number} [friction=gamePhysics.friction]
   * @param {number} [speed=0]
   * @param {number} [direction=0]
   *
   * @param {object} events
   * @param {GameObjectAction} events.create
   * @param {GameObjectAction} events.destroy
   * @param {GameObjectAction} events.create
   * @param {GameDrawingAction} events.draw
   * @param {GameObjectAction} events.keyActive
   * @param {GameObjectAction} events.keyDown
   * @param {GameObjectAction} events.keyUp
   * @param {GameObjectAction} events.mouseActive
   * @param {GameObjectAction} events.mouseDown
   * @param {GameObjectAction} events.mouseUp
   * @param {GameObjectAction} events.step
   *
   * @param {object} ...properties
   */
  constructor({
    persist = false,
    sprite,
    solid = true,
    x = 0,
    y = 0,
    acceleration = 0,
    gravity = gamePhysics.gravity,
    friction = gamePhysics.friction,
    speed = 0,
    direction = 0,
    events = {},
    ...properties
  } = {}) {
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
    Object.keys(properties).forEach(property => {
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
    return (
      this.y -
      this.sprite.insertionY * this.sprite.scaleY +
      this.sprite.boundingBoxTop * this.sprite.scaleY
    )
  }

  get boundingBoxLeft() {
    return (
      this.x -
      this.sprite.insertionX * this.sprite.scaleX +
      this.sprite.boundingBoxLeft * this.sprite.scaleX
    )
  }

  get boundingBoxRight() {
    return (
      this.boundingBoxLeft + this.sprite.boundingBoxWidth * this.sprite.scaleX
    )
  }

  get boundingBoxBottom() {
    return (
      this.boundingBoxTop + this.sprite.boundingBoxHeight * this.sprite.scaleY
    )
  }

  get boundingBoxWidth() {
    return Math.abs(this.boundingBoxRight - this.boundingBoxLeft)
  }

  get boundingBoxHeight() {
    return Math.abs(this.boundingBoxTop - this.boundingBoxBottom)
  }

  /**
   * Called when the object is created in the room.
   */
  create() {
    this.events?.create?.(this)
  }

  destroy() {
    this.events?.destroy?.(this)

    const index = GameObject.instances.indexOf(this)
    GameObject.instances.splice(index, 1)
  }

  moveTo(x, y) {
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
      Object.keys(gameKeyboard.down).forEach(key => {
        this.events.keyDown?.[key]?.(this)
        // keydown should only register for one step
        // TODO: buggy response to keydown, need queues, see TODO.md
        delete gameKeyboard.down[key]
      })
    }

    // keyActive
    if (this.events.keyActive) {
      Object.keys(gameKeyboard.active).forEach(key => {
        this.events.keyActive?.[key]?.(this)
      })
    }

    // keyUp
    if (this.events.keyUp) {
      Object.keys(gameKeyboard.up).forEach(key => {
        this.events.keyUp?.[key]?.(this)

        // keyup events should only fire for one step
        delete gameKeyboard.up[key]
      })
    }

    // mouseDown
    if (this.events.mouseDown) {
      Object.keys(gameMouse.down)
        .filter(button => gameMouse.down[button] !== null)
        .forEach(key => {
          this.events.mouseDown?.[key]?.(this)
          // keydown should only register for one step
          // remember which we've handled so we don't handle them again
          gameMouse.down[key] = null
        })
    }

    // mouseActive
    if (this.events.mouseActive) {
      Object.keys(gameMouse.active).forEach(button => {
        this.events.mouseActive?.[button]?.(this)
      })
    }

    // mouseUp
    if (this.events.mouseUp) {
      Object.keys(gameMouse.up).forEach(button => {
        this.events.mouseUp?.[button]?.(this)

        // keyup events should only fire for one step
        delete gameMouse.up[button]
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

    // TODO: this requires having a bounding box at all times to compute collision.
    //       currently, only sprites have bounding boxes.
    //       GameObject should have a bounding box, and it should defer to the sprite's bounding box if present.
    //       This way, objects can have collisions without sprites, such as when custom drawing an object with GameDrawing.
    // stop on solid objects
    // TODO: this is naive and shouldn't assume platformer (collision on bottom, stop vspeed)
    //       should instead check collisions on all sides and stop each direction if appropriate
    // if (
    //   collision.objects(this, 'solid', o => {
    //     return collision.onBottom(this, o)
    //   })
    // ) {
    //   this.vspeed = 0
    // }

    //
    // Movement
    //

    // apply final calculated movement values
    this.move(this.direction, this.speed)

    // TODO: if ! solid collision below:
    //   moveToCollisionPoint()
    //   keep outside solid objects!
    //   this is the same as moving outside the room and stopping / moving back to room edge
  }

  /**
   * This method should draw the object. Called on every tick of the loop.
   *
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

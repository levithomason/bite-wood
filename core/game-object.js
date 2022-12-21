import * as collision from './collision.js'
import { gameKeyboard } from './game-keyboard-controller.js'
import { gameMouse } from './game-mouse-controller.js'
import { gamePhysics } from './game-physics-controller.js'
import { gameRooms } from './game-rooms.js'
import { gameState } from './game-state-controller.js'
import { Vector } from './math.js'

/**
 * @typedef {function} Action
 * @param {GameObject} self
 */

export class GameObject {
  /**
   * @param {GameSprite} sprite
   * @param {boolean} [persist=false] - Determines whether this object should still exist when the room changes.
   * @param {boolean} [solid=true]
   *
   * @param {number} [x=0]
   * @param {number} [y=0]
   * @param {number} [acceleration=0]
   * @param {number} [gravity=gamePhysics.gravity.magnitude]
   * @param {number} [gravityDirection =gamePhysics.gravity.direction]
   * @param {number} [friction=0]
   * @param {number} [speed=0]
   * @param {number} [direction=0]
   *
   * @param {object} events
   * @param {object} events.create
   * @param {Action[]} events.create.actions
   * @param {object} events.draw
   * @param {Action[]} events.draw.actions
   * @param {object} events.keyActive
   * @param {object} events.keyDown
   * @param {object} events.keyUp
   * @param {object} events.mouseActive
   * @param {object} events.mouseDown
   * @param {object} events.mouseUp
   * @param {object} events.step
   * @param {Action[]} events.step.actions
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
    gravity = gamePhysics.gravity.magnitude,
    gravityDirection = gamePhysics.gravity.direction,
    friction = 0,
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
    this.gravityDirection = gravityDirection
    this._vector = new Vector(direction, speed)
    this.events = events

    // assign any custom properties the developer passed in
    Object.keys(properties).forEach(property => {
      this[property] = properties[property]
    })

    this.init = this.init.bind(this)
    this.moveTo = this.moveTo.bind(this)
    this.move = this.move.bind(this)
    this.motionAdd = this.motionAdd.bind(this)
    this.setSprite = this.setSprite.bind(this)
    this.step = this.step.bind(this)
    this.draw = this.draw.bind(this)
  }

  get displayName() {
    return this.constructor.displayName
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
  init() {
    this.events.create?.actions?.forEach(action => {
      action(this)
    })
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
        this.events.keyDown?.[key]?.actions.forEach(action => {
          action(this)
        })
        // keydown should only register for one step
        // remember which we've handled so we don't handle them again
        gameKeyboard.down[key] = null
      })
    }

    // keyActive
    if (this.events.keyActive) {
      Object.keys(gameKeyboard.active).forEach(key => {
        this.events.keyActive?.[key]?.actions.forEach(action => {
          action(this)
        })
      })
    }

    // keyUp
    if (this.events.keyUp) {
      Object.keys(gameKeyboard.up).forEach(key => {
        this.events.keyUp?.[key]?.actions.forEach(action => {
          action(this)
        })

        // keyup events should only fire for one step
        delete gameKeyboard.up[key]
      })
    }

    // mouseDown
    if (this.events.mouseDown) {
      Object.keys(gameMouse.down)
        .filter(button => gameMouse.down[button] !== null)
        .forEach(key => {
          this.events.mouseDown?.[key]?.actions.forEach(action => {
            action(this)
          })
          // keydown should only register for one step
          // remember which we've handled so we don't handle them again
          gameMouse.down[key] = null
        })
    }

    // mouseActive
    if (this.events.mouseActive) {
      Object.keys(gameMouse.active).forEach(button => {
        this.events.mouseActive?.[button]?.actions.forEach(action => {
          action(this)
        })
      })
    }

    // mouseUp
    if (this.events.mouseUp) {
      Object.keys(gameMouse.up).forEach(button => {
        this.events.mouseUp?.[button]?.actions.forEach(action => {
          action(this)
        })

        // keyup events should only fire for one step
        delete gameMouse.up[button]
      })
    }

    //
    // Sprite
    // The sprite contains the bounding box and needs to step before the physics.
    //
    if (this.sprite && this.sprite.step) {
      this.sprite.step()
    }

    // //
    // // Physics
    // //
    //
    // // apply gravity
    // if (this.y < gameRooms.currentRoom.height) {
    //   this.motionAdd(this.gravityDirection, this.gravity)
    // }

    // // terminal velocity
    // this.vspeed = Math.min(this.vspeed, gamePhysics.terminalVelocity)

    // // apply friction
    // this.hspeed = this.hspeed * (1 - this.friction)
    //
    // if (this.events.step && this.events.step.actions) {
    //   this.events.step.actions.forEach(action => {
    //     action(this)
    //   })
    // }
    //
    // // stop on solid objects
    // if (
    //   collision.objects(this, 'solid', o => {
    //     return collision.onBottom(this, o)
    //   })
    // ) {
    //   this.vspeed = 0
    // }

    // //
    // // Movement
    // //

    // apply final calculated movement values
    this.move(this.direction, this.speed)

    // // TODO: if ! solid collision below:
    // //   moveToCollisionPoint()
    // //   keep outside solid objects!
    // //   this is the same as moving outside the room and stopping / moving back to room edge
    //
    // // keep in room
    // if (this.x < 0 && gameRooms.isFirstRoom()) {
    //   this.hspeed = 0
    //   this.x = 0
    // } else if (this.x > gameRooms.currentRoom.width && gameRooms.isLastRoom()) {
    //   this.hspeed = 0
    //   this.x = gameRooms.currentRoom.width
    // }
    //
    // if (this.y > gameRooms.currentRoom.height && this.vspeed > 0) {
    //   this.vspeed = 0
    //   this.y = gameRooms.currentRoom.height
    // }
  }

  /**
   * This method should draw the object. Called on every tick of the loop.
   *
   * @param {GameObject} self
   * @param {GameDrawing} drawing
   */
  draw(self, drawing) {
    if (this.sprite) {
      drawing.sprite(this.sprite, this.x, this.y)
    }

    if (gameState.isPlaying) {
      this.events?.draw?.actions.forEach(action => {
        action(this, drawing)
      })
    }
  }
}

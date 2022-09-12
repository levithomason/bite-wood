import state from '../state.js'
import * as utils from '../math.js'
import * as collision from '../collision.js'
import GameSprite from './game-sprite'
import GameEventHooks from './game-events'

export default class GameObject {
  persist: boolean
  sprite: GameSprite | undefined
  solid: boolean
  x: number
  y: number
  acceleration: number
  friction: number
  gravity: number
  gravityDirection: number
  _vector: utils.Vector
  events: GameEventHooks
  startX: number
  startY: number
  displayName: string

  constructor({
    persist = false,
    sprite = undefined,
    solid = true,
    x = 0,
    y = 0,
    acceleration = 0.2,
    gravity = 0,
    gravityDirection = state.physics.gravity.direction,
    friction = 0,
    speed = 0,
    direction = 0,
    events,
    displayName = 'Unknown',
    ...properties
  }) {
    this.persist = persist
    this.sprite = sprite
    this.solid = solid
    this.x = x
    this.y = y
    this.acceleration = acceleration
    this.friction = friction
    this.gravity = gravity
    this.gravityDirection = gravityDirection
    this._vector = new utils.Vector(direction, speed)
    this.events = events
    this.displayName = displayName

    Object.keys(properties).forEach(property => {
      this[property] = properties[property]
    })

    this.setSprite = this.setSprite.bind(this)
    this.invokeEvents = this.invokeEvents.bind(this)
    this.step = this.step.bind(this)
    this.draw = this.draw.bind(this)

    this.move = this.move.bind(this)
    this.moveTo = this.moveTo.bind(this)
    this.motionAdd = this.motionAdd.bind(this)

    if (events.create && events.create.actions) {
      events.create.actions.forEach((action) => {
        action(this, state)
      })
    }

    this.startX = this.x
    this.startY = this.y
  }

  toJSON() {
    return JSON.stringify({ ...this, events: null }, null, 2)
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
      return (
        this.y -
        this.sprite.insertionY * this.sprite.scaleY +
        this.sprite.boundingBoxTop * this.sprite.scaleY
      )
    }
    console.warn(
      `${this.displayName}: Tried to get boundingBoxTop from object with no sprite`,
    )
  }

  get boundingBoxLeft() {
    if (this.sprite) {
      return (
        this.x -
        this.sprite.insertionX * this.sprite.scaleX +
        this.sprite.boundingBoxLeft * this.sprite.scaleX
      )
    }
    console.warn(
      `${this.displayName}: Tried to get boundingBoxLeft from object with no sprite`,
    )
  }

  get boundingBoxRight() {
    if (this.sprite && this.boundingBoxLeft) {
      return (
        this.boundingBoxLeft + this.sprite.boundingBoxWidth * this.sprite.scaleX
      )
    }
    console.warn(
      `${this.displayName}: Tried to get boundingBoxRight from object with no sprite`,
    )
  }

  get boundingBoxBottom() {
    if (this.sprite && this.boundingBoxTop) {
      return (
        this.boundingBoxTop + this.sprite.boundingBoxHeight * this.sprite.scaleY
      )
    }
    console.warn(
      `${this.displayName}: Tried to get boundingBoxBottom from object with no sprite`,
    )
  }

  moveTo(x: number, y: number) {
    this.x = x
    this.y = y
  }

  move(direction: number, distance: number) {
    const newX = this.x + distance * Math.cos((direction * Math.PI) / 180)
    const newY = this.y + distance * Math.sin((direction * Math.PI) / 180)

    this.x = newX
    this.y = newY
  }

  motionAdd(direction: number, speed: number) {
    this._vector.add(direction, speed)
  }

  setSprite(sprite: GameSprite) {
    if (sprite === this.sprite) return

    this.sprite = sprite
    this.sprite.frameIndex = 0
    this.sprite.stepsThisFrame = 0
  }

  invokeEvents() {
    // KEYDOWN
    if (this.events.keyDown) {
      Object.keys(state.keys.down)
        .filter(key => state.keys.down[key] !== null)
        .forEach(key => {
          if (this.events.keyDown[key] && this.events.keyDown[key].actions) {
            this.events.keyDown[key].actions.forEach((action) => {
              action(this, state)
            })
          }
          // keydown should only register for one step
          // remember which we've handled so we don't handle them again
          state.keys.down[key] = null
        })
    }

    // KEYACTIVE
    if (this.events.keyActive) {
      Object.keys(state.keys.active).forEach(key => {
        if (this.events.keyActive[key] && this.events.keyActive[key].actions) {
          this.events.keyActive[key].actions.forEach((action) => {
            action(this, state)
          })
        }
      })
    }

    // KEYUP
    if (this.events.keyUp) {
      Object.keys(state.keys.up).forEach(key => {
        if (this.events.keyUp[key] && this.events.keyUp[key].actions) {
          this.events.keyUp[key].actions.forEach((action) => {
            action(this, state)
          })
        }

        // keyup events should only fire for one step
        delete state.keys.up[key]
      })
    }

    // MOUSEDOWN
    if (this.events.mouseDown) {
      Object.keys(state.mouse.down)
        .filter(button => state.mouse.down[button] !== null)
        .forEach(key => {
          if (
            this.events.mouseDown[key] &&
            this.events.mouseDown[key].actions
          ) {
            this.events.mouseDown[key].actions.forEach((action) => {
              action(this, state)
            })
          }
          // keydown should only register for one step
          // remember which we've handled so we don't handle them again
          state.mouse.down[key] = null
        })
    }

    // MOUSEACTIVE
    if (this.events.mouseActive) {
      Object.keys(state.mouse.active).forEach(button => {
        if (
          this.events.mouseActive[button] &&
          this.events.mouseActive[button].actions
        ) {
          this.events.mouseActive[button].actions.forEach((action) => {
            action(this, state)
          })
        }
      })
    }

    // MOUSEUP
    if (this.events.mouseUp) {
      Object.keys(state.mouse.up).forEach(button => {
        if (
          this.events.mouseUp[button] &&
          this.events.mouseUp[button].actions
        ) {
          this.events.mouseUp[button].actions.forEach((action) => {
            action(this, state)
          })
        }

        // keyup events should only fire for one step
        delete state.mouse.up[button]
      })
    }
  }

  step() {
    this.invokeEvents()

    if (this.sprite && this.sprite.step) {
      this.sprite.step()
    }

    // apply gravity
    if (this.y < state.room.height) {
      this.motionAdd(this.gravityDirection, this.gravity)
    }

    // terminal velocity
    this.vspeed = Math.min(this.vspeed, state.physics.terminalVelocity)

    // apply friction
    this.hspeed = this.hspeed * (1 - this.friction)

    if (this.events.step && this.events.step.actions) {
      this.events.step.actions.forEach(action => {
        action(this, state)
      })
    }

    // stop on solid objects
    if (
      collision.objects(this, 'solid', (o: GameObject) => {
        return collision.onBottom(this, o)
      })
    ) {
      this.vspeed = 0
    }

    // apply final calculated movement values
    this.move(this.direction, this.speed)

    // if ! solid collision below:
    // moveToCollisionPoint()
    // keep outside solid objects!
    // this is the same as moving outside the room and stopping / moving back to room edge

    // keep in room
    if (this.x < 0 && state.isFirstRoom()) {
      this.hspeed = 0
      this.x = 0
    } else if (this.x > state.room.width && state.isLastRoom()) {
      this.hspeed = 0
      this.x = state.room.width
    }

    if (this.y > state.room.height && this.vspeed > 0) {
      this.vspeed = 0
      this.y = state.room.height
    }
  }

  draw(drawing) {
    if (this.sprite) {
      drawing.sprite(this.sprite, this.x, this.y)

      if (state.debug) {
        drawing.objectDebug(this)
      }
    }

    if (
      state.isPlaying &&
      this.events &&
      this.events.draw &&
      this.events.draw.actions
    ) {
      this.events.draw.actions.forEach(action => {
        action(this, state, drawing)
      })
    }
  }
}

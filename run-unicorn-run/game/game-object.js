import * as draw from '../draw.js'
import physics, { Vector } from '../physics.js'
import state from '../state.js'
import * as utils from '../utils.js'

export default class GameObject {
  constructor({
    sprite,
    x = 0,
    y = 0,
    acceleration = 0.2,
    gravity = physics.gravity.magnitude,
    gravityDirection = physics.gravity.direction,
    friction = physics.friction,
    speed = 0,
    maxSpeed = 20,
    direction = 0,
    events = {},
    ...rest
  }) {
    this.sprite = sprite
    this.x = x
    this.y = y
    this.acceleration = acceleration
    this.friction = friction
    this.gravity = gravity
    this.gravityDirection = gravityDirection
    this.velocity = new Vector(direction, speed)
    this.maxSpeed = maxSpeed
    this.events = events

    Object.keys(rest).forEach(key => {
      this[key] = rest[key]
    })

    this.setSprite = this.setSprite.bind(this)
    this.invokeKeyboardEvents = this.invokeKeyboardEvents.bind(this)
    this.step = this.step.bind(this)
    this.draw = this.draw.bind(this)

    this.move = this.move.bind(this)
    this.moveTo = this.moveTo.bind(this)
    this.motionAdd = this.motionAdd.bind(this)
  }

  get speed() {
    return this.velocity.magnitude
  }

  set speed(speed) {
    this.velocity.magnitude = speed
  }

  get hspeed() {
    return this.velocity.x
  }

  set hspeed(hspeed) {
    this.velocity.x = hspeed
  }

  get vspeed() {
    return this.velocity.y
  }

  set vspeed(vspeed) {
    this.velocity.y = vspeed
  }

  get direction() {
    return this.velocity.direction
  }

  set direction(direction) {
    this.velocity.direction = direction
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

  moveTo(x, y) {
    this.x = x
    this.y = y
  }

  move(direction, distance) {
    const { x, y } = utils.move(this.x, this.y, direction, distance)

    this.x = x
    this.y = y
  }

  motionAdd(direction, speed) {
    this.velocity.add(direction, speed)
  }

  setSprite(sprite) {
    if (sprite === this.sprite) return

    this.sprite = sprite
    this.sprite.frameIndex = 0
    this.sprite.stepsThisFrame = 0
  }

  invokeKeyboardEvents() {
    // KEYDOWN
    if (this.events.keyDown) {
      Object.keys(state.keysDown)
        .filter(key => state.keysDown[key] !== 'handled')
        .forEach(key => {
          if (this.events.keyDown[key] && this.events.keyDown[key].actions) {
            this.events.keyDown[key].actions.forEach(action => {
              action(this)
            })
          }
          // keydown should only register for one step
          // remember which we've handled so we don't handle them again
          state.keysDown[key] = 'handled'
        })
    }

    // KEYBOARD
    if (this.events.keyboard) {
      Object.keys(state.keys).forEach(key => {
        if (this.events.keyboard[key] && this.events.keyboard[key].actions) {
          this.events.keyboard[key].actions.forEach(action => {
            action(this)
          })
        }
      })
    }

    // KEYUP
    if (this.events.keyUp) {
      Object.keys(state.keysUp).forEach(key => {
        // since key events are handled on game step we can only safely remove
        // keyboard and keydown events after a game step handles the keyup event
        delete state.keys[key]
        delete state.keysDown[key]

        if (this.events.keyUp[key] && this.events.keyUp[key].actions) {
          this.events.keyUp[key].actions.forEach(action => {
            action(this)
          })
        }

        // keyup events should only fire for one step
        delete state.keysUp[key]
      })
    }
  }

  step() {
    this.invokeKeyboardEvents()

    if (this.sprite && this.sprite.step) {
      this.sprite.step()
    }

    if (this.events.step && this.events.step.actions) {
      this.events.step.actions.forEach(action => {
        action(this)
      })
    }

    // apply gravity
    if (this.y < state.height) {
      this.motionAdd(this.gravityDirection, this.gravity)
    }

    // terminal velocity
    this.vspeed = Math.min(this.vspeed, physics.terminalVelocity)

    // apply friction
    this.hspeed = this.hspeed * (1 - this.friction)

    // apply max speed
    this.hspeed =
      Math.sign(this.hspeed) * Math.min(Math.abs(this.hspeed), this.maxSpeed)

    // apply final calculated movement values
    this.move(this.direction, this.speed)

    // keep in room
    if (this.x < 0) {
      this.hspeed = 0
      this.x = 0
    } else if (this.x > state.width) {
      this.hspeed = 0
      this.x = state.width
    }

    if (this.y < 0 && this.vspeed < 0) {
      this.vspeed = 0
      this.y = 0
    } else if (this.y > state.height && this.vspeed > 0) {
      this.vspeed = 0
      this.y = state.height
    }
  }

  draw() {
    if (this.sprite) {
      draw.sprite(this.sprite, this.x, this.y)

      if (state.debug) {
        draw.objectDebug(this)
      }
    }
  }
}

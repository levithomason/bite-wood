import * as draw from './draw.js'
import physics, { Vector } from './physics.js'
import * as utils from './utils.js'

// ----------------------------------------
// Game
// ----------------------------------------
export class Game {
  /**
   * @property objects {GameObject[]}
   * @property keysDown {object}
   */
  constructor() {
    this.debug = true
    this.width = 800
    this.height = 600

    const canvas = draw.init(this.width, this.height)
    document.body.append(canvas)

    this.objects = []
    this.keys = {}
    this.keysDown = {}
    this.keysUp = {}
    this.handleKeyDown = this.handleKeyDown.bind(this)
    this.handleKeyUp = this.handleKeyUp.bind(this)

    this.addObject = this.addObject.bind(this)
    this.setBackgroundImage = this.setBackgroundImage.bind(this)

    this.start = this.start.bind(this)
    this.pause = this.pause.bind(this)
    this.tick = this.tick.bind(this)

    this.step = this.step.bind(this)
    this.draw = this.draw.bind(this)

    document.addEventListener('keydown', this.handleKeyDown)
    document.addEventListener('keyup', this.handleKeyUp)
  }

  /** @param e {KeyboardEvent} */
  handleKeyDown(e) {
    this.keys[e.key] = true

    // ensure keydown only fires once per game step
    // only track it after it has been removed by the step method
    if (!this.keysDown.hasOwnProperty(e.key)) {
      this.keysDown[e.key] = true
    }
  }

  /** @param e {KeyboardEvent} */
  handleKeyUp(e) {
    this.keysUp[e.key] = true
  }

  /** @param object {GameObject} */
  addObject(object) {
    object.game = this
    this.objects.push(object)
  }

  /** @param image {HTMLImageElement} */
  setBackgroundImage(image) {
    this.background = image
  }

  start() {
    this.isPlaying = true
    this.tick()
  }

  pause() {
    this.isPlaying = false
    cancelAnimationFrame(this.timer)
  }

  tick() {
    this.step()
    this.draw()

    if (this.isPlaying) {
      this.timer = requestAnimationFrame(this.tick)
    }
  }

  step() {
    this.objects.forEach(object => {
      if (object.step) {
        object.step()
      }
    })
  }

  draw() {
    draw.erase()
    draw.image(this.background)

    if (this.debug) {
      draw.grid()
    }

    this.objects.forEach(object => {
      if (object.draw) object.draw()
    })
  }
}

// ----------------------------------------
// GameImage
// ----------------------------------------
export class GameImage {
  constructor(src) {
    this.image = new Image()
    this.image.src = src
  }
}

// ----------------------------------------
// GameSprite
// ----------------------------------------
export class GameSprite {
  constructor({
    image,
    scaleX = 1,
    scaleY = 1,
    insertionX = 0,
    insertionY = 0,
    offsetX = 0,
    offsetY = 0,
    frameWidth,
    frameHeight,
    frameCount = 1,
    frameIndex = 0,
    stepsPerFrame = 1,
  }) {
    this.image = image
    this.scaleX = scaleX
    this.scaleY = scaleY
    this.insertionX = insertionX
    this.insertionY = insertionY
    this.offsetX = offsetX
    this.offsetY = offsetY
    this.frameWidth = frameWidth
    this.frameHeight = frameHeight
    this.frameCount = frameCount
    this.frameIndex = frameIndex
    this.stepsPerFrame = stepsPerFrame

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

// ----------------------------------------
// GameObject
// ----------------------------------------
export class GameObject {
  constructor({
    sprite,
    x = 0,
    y = 0,
    acceleration = 0.2,
    gravity = physics.gravity.magnitude,
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
    this.velocity = new Vector(direction, speed)
    this.maxSpeed = maxSpeed
    this.events = events
    this.game = null

    Object.keys(rest).forEach(key => {
      this[key] = rest[key]
    })

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
      Object.keys(this.game.keysDown)
        .filter(key => this.game.keysDown[key] !== 'handled')
        .forEach(key => {
          if (this.events.keyDown[key] && this.events.keyDown[key].actions) {
            this.events.keyDown[key].actions.forEach(action => {
              action(this)
            })
          }
          // keydown should only register for one step
          // remember which we've handled so we don't handle them again
          this.game.keysDown[key] = 'handled'
        })
    }

    // KEYBOARD
    if (this.events.keyboard) {
      Object.keys(this.game.keys).forEach(key => {
        if (this.events.keyboard[key] && this.events.keyboard[key].actions) {
          this.events.keyboard[key].actions.forEach(action => {
            action(this)
          })
        }
      })
    }

    // KEYUP
    if (this.events.keyUp) {
      Object.keys(this.game.keysUp).forEach(key => {
        // since key events are handled on game step we can only safely remove
        // keyboard and keydown events after a game step handles the keyup event
        delete this.game.keys[key]
        delete this.game.keysDown[key]

        if (this.events.keyUp[key] && this.events.keyUp[key].actions) {
          this.events.keyUp[key].actions.forEach(action => {
            action(this)
          })
        }

        // keyup events should only fire for one step
        delete this.game.keysUp[key]
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

    // apply movement
    this.move(this.direction, this.speed)

    // apply friction
    this.hspeed = this.hspeed * (1 - this.friction)

    // apply max speed
    this.hspeed =
      this.hspeed > 0
        ? Math.min(this.hspeed, this.maxSpeed)
        : Math.max(this.hspeed, -this.maxSpeed)

    // apply gravity
    if (this.y < this.game.height) {
      this.motionAdd(this.gravity.direction, this.gravity.magnitude)
    }

    // terminal velocity
    this.vspeed = Math.min(this.vspeed, physics.terminalVelocity)

    // keep in room
    if (this.x < 0) {
      this.hspeed = 0
      this.x = 0
    } else if (this.x > this.game.width) {
      this.hspeed = 0
      this.x = this.game.width
    }

    if (this.y < 0) {
      this.vspeed = 0
      this.y = 0
    } else if (this.y > this.game.height) {
      this.vspeed = 0
      this.y = this.game.height
    }
  }

  draw() {
    const { sprite, x, y } = this

    draw.image(
      sprite.image,
      sprite.offsetX + sprite.frameIndex * sprite.frameWidth,
      sprite.offsetY,
      sprite.frameWidth,
      sprite.frameHeight,
      x - sprite.insertionX * sprite.scaleX,
      y - sprite.insertionY * sprite.scaleY,
      sprite.frameWidth * sprite.scaleX,
      sprite.frameHeight * sprite.scaleY,
    )

    if (this.game.debug) {
      draw.objectDebug(this)
    }
  }
}

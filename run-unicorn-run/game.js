import * as draw from './draw.js'
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
      object.draw()
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
  constructor({ sprite, x = 0, y = 0, speed = 0, direction = 0, events = {} }) {
    this.sprite = sprite
    this.x = x
    this.y = y
    this.speed = speed
    this.direction = direction
    this.events = events
    this.game = null

    this.invokeKeyboardEvents = this.invokeKeyboardEvents.bind(this)
    this.step = this.step.bind(this)
    this.draw = this.draw.bind(this)

    this.move = this.move.bind(this)
    this.moveTo = this.moveTo.bind(this)
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

    if (this.speed !== 0) {
      this.move(this.direction, this.speed)
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

  move(direction, distance) {
    const { x, y } = utils.move(this.x, this.y, direction, distance)

    this.x = x
    this.y = y
  }

  accelerate(direction, speed, maxSpeed) {
    const addX = speed * Math.cos(direction)
    const addY = speed * Math.sin(direction)

    this.speed = Math.min(this.speed + speed, maxSpeed)
  }

  moveTo(x, y) {
    this.x = x
    this.y = y
  }

  setSprite(sprite) {
    if (sprite === this.sprite) return

    this.sprite = sprite
    this.sprite.frameIndex = 0
    this.sprite.stepsThisFrame = 0
  }
}

export class Vector {
  constructor() {
    this.angle = 0
    this.magnitude = 0
  }

  get angle() {
    return utils.toDegrees(this._angle)
  }

  set angle(angle) {
    this._angle = utils.toRadians(angle)
    this._adjacent = this._hypotenuse * Math.cos(this._angle)
    this._opposite = this._hypotenuse * Math.sin(this._angle)
  }

  get magnitude() {
    return this._hypotenuse
  }

  set magnitude(hypotenuse) {
    this._hypotenuse = hypotenuse
    this._adjacent = this._hypotenuse * Math.cos(this._angle)
    this._opposite = this._hypotenuse * Math.sin(this._angle)
  }

  get x() {
    return this._adjacent
  }

  set x(adjacent) {
    this._adjacent = adjacent
    this._angle = Math.atan2(this._opposite, this._adjacent)
    this._hypotenuse = this._opposite / Math.cos(this._angle)
  }

  get y() {
    return this._opposite
  }

  set y(opposite) {
    this._opposite = opposite
    this._angle = Math.atan2(this._opposite, this._adjacent)
    this._hypotenuse = this._opposite / Math.cos(this._angle)
  }

  add(angle, speed) {}

  draw() {
    const originX = 300
    const originY = 300

    draw.saveSettings()

    // adjacent
    draw.line(originX, originY, originX + this.x, originY)
    // opposite
    draw.line(originX + this.x, originY, originX + this.x, originY + this.y)
    // hypotenuse
    draw.setBorderColor('red')
    draw.setFillColor('red')
    draw.line(originX, originY, originX + this.x, originY + this.y)
    draw.rectangle(originX + this.x - 2, originY + this.y - 2, 5, 5)

    draw.setBorderColor('black')
    draw.setFillColor('transparent')
    // 90°
    draw.rectangle(
      originX + this.x + 10 * -Math.sign(this.x),
      originY,
      10 * Math.sign(this.x),
      10 * Math.sign(this.y),
    )

    // labels: x, y, angle, magnitude
    draw.textAlign('center')
    draw.setFillColor('red')
    draw.text(
      Math.round(this.magnitude),
      originX + this.x / 2 - 20 * Math.sign(this.x),
      originY + this.y / 2,
    )

    draw.loadSettings()
    draw.text(
      'x ' + Math.round(this.x),
      originX + this.x / 2,
      originY + 15 * -Math.sign(this.y),
    )
    draw.text(
      'y ' + Math.round(this.y),
      originX + this.x + 30 * Math.sign(this.x),
      originY + this.y / 2,
    )
    draw.text(
      Math.round(this.angle) + '°',
      originX + this.x / 4,
      originY + this.y / 10 + 4,
    )
  }
}

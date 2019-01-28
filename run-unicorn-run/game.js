import * as utils from './utils.js'

const physics = {
  gravity: 0.5,
  gravityDirection: 90,
  terminalVelocity: 10,
  friction: 1,
}

// ----------------------------------------
// Game
// ----------------------------------------
export class Game {
  /**
   * @property canvas {HTMLCanvasElement}
   * @property ctx {CanvasRenderingContext2D}
   * @property objects {GameObject[]}
   * @property keysDown {object}
   */
  constructor() {
    this.debug = true

    this.canvas = document.getElementById('game')
    this.ctx = this.canvas.getContext('2d')
    this.ctx.imageSmoothingEnabled = false // pixelated

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
      object.step()
    })
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    this.ctx.drawImage(this.background, 0, 0)

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
    this.xPrev = x
    this.yPrev = y
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

  get hspeed() {
    return Math.abs(this.x - this.xPrev)
  }

  get vspeed() {
    return Math.abs(this.y - this.yPrev)
  }

  step() {
    const xPrev = this.x
    const yPrev = this.y

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

    this.xPrev = xPrev
    this.yPrev = yPrev
  }

  draw() {
    const {
      sprite,
      x,
      y,
      xPrev,
      yPrev,
      speed,
      hspeed,
      vspeed,
      direction,
    } = this

    this.game.ctx.drawImage(
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
      // bounding box
      this.game.ctx.setLineDash([3, 3])
      this.game.ctx.strokeRect(
        x - sprite.insertionX * sprite.scaleX,
        y - sprite.insertionY * sprite.scaleY,
        sprite.frameWidth * sprite.scaleX,
        sprite.frameHeight * sprite.scaleY,
      )

      // insertion point
      this.game.ctx.setLineDash([])
      this.game.ctx.strokeStyle = 'inverted'
      this.game.ctx.beginPath()
      this.game.ctx.moveTo(x - 10, y)
      this.game.ctx.lineTo(x + 10, y)
      this.game.ctx.moveTo(x, y - 10)
      this.game.ctx.lineTo(x, y + 10)
      this.game.ctx.stroke()

      // text values
      this.game.ctx.font = '12px monospace'
      this.game.ctx.textAlign = 'left'
      const lines = [
        `x          = ${x}`,
        `y          = ${y}`,
        `xPrev      = ${xPrev}`,
        `yPrev      = ${yPrev}`,
        `direction  = ${direction}`,
        `speed      = ${speed}`,
        `hspeed     = ${hspeed}`,
        `vspeed     = ${vspeed}`,
      ]
        .reverse()
        .forEach((text, i) => {
          this.game.ctx.fillText(
            text,
            x - sprite.insertionX,
            y - sprite.frameHeight - sprite.insertionY - 4 - i * 14,
          )
        })
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

  accelerate(direction, speed) {

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

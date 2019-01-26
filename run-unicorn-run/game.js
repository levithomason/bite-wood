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
    this.debug = false

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
    this.keysDown[e.key] = true
    delete this.keysUp[e.key]
  }

  /** @param e {KeyboardEvent} */
  handleKeyUp(e) {
    delete this.keys[e.key]
    delete this.keysDown[e.key]
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
    this.timer = requestAnimationFrame(this.tick)
  }

  pause() {
    this.isPlaying = false
    cancelAnimationFrame(this.timer)
  }

  tick() {
    this.step()
    this.draw()

    if (this.isPlaying) {
      requestAnimationFrame(this.tick)
    }
  }

  step() {
    this.objects.forEach(object => {
      // keydown events
      if (object.events.keyDown) {
        Object.keys(this.keysDown).forEach(key => {
          if (
            object.events.keyDown[key] &&
            object.events.keyDown[key].actions
          ) {
            object.events.keyDown[key].actions.forEach(action => {
              action(object)
            })
          }
          // keydown should only register for one step
          delete this.keysDown[key]
        })
      }

      // keyboard events
      if (object.events.keyboard) {
        Object.keys(this.keys).forEach(key => {
          if (
            object.events.keyboard[key] &&
            object.events.keyboard[key].actions
          ) {
            object.events.keyboard[key].actions.forEach(action => {
              action(object)
            })
          }
        })
      }

      // keyup events
      if (object.events.keyUp) {
        Object.keys(this.keysUp).forEach(key => {
          if (object.events.keyUp[key] && object.events.keyUp[key].actions) {
            object.events.keyUp[key].actions.forEach(action => {
              action(object)
            })
          }
          // keyup should only register for one step
          delete this.keysUp[key]
        })
      }

      // step
      if (object.sprite && object.sprite.step) object.sprite.step()

      if (object.events.step && object.events.step.actions) {
        object.events.step.actions.forEach(action => action(object))
      }
    })
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    this.ctx.drawImage(this.background, 0, 0)

    this.objects.forEach(({ x, y, sprite }) => {
      this.ctx.drawImage(
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

      if (this.debug) {
        // bounding box
        this.ctx.setLineDash([3, 3])
        this.ctx.strokeRect(
          x - sprite.insertionX * sprite.scaleX,
          y - sprite.insertionY * sprite.scaleY,
          sprite.frameWidth * sprite.scaleX,
          sprite.frameHeight * sprite.scaleY,
        )

        // insertion point
        this.ctx.setLineDash([])
        this.ctx.strokeStyle = 'inverted'
        this.ctx.beginPath()
        this.ctx.moveTo(x - 10, y)
        this.ctx.lineTo(x + 10, y)
        this.ctx.moveTo(x, y - 10)
        this.ctx.lineTo(x, y + 10)
        this.ctx.stroke()
      }
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

    this.move = this.move.bind(this)
    this.moveTo = this.moveTo.bind(this)
  }

  move(direction, distance) {
    const newX = this.x + distance * Math.cos((direction * Math.PI) / 180)
    const newY = this.y + distance * Math.sin((direction * Math.PI) / 180)

    this.x = Math.round(newX)
    this.y = Math.round(newY)
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

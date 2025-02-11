import { random } from './math.js'
import { GameObject } from './game-object.js'
import { GameAudio } from './game-audio.js'
import { GameImage } from './game-image.js'
import { GameDrawing } from './game-drawing.js'

export type GameRoomConfig = {
  width: number
  height: number
  backgroundColor?: string | CanvasGradient | CanvasPattern
  backgroundImage?: GameImage
  backgroundMusic?: GameAudio
}

export class GameRoom implements GameRoomConfig {
  width: GameRoomConfig['width']
  height: GameRoomConfig['height']
  backgroundColor: GameRoomConfig['backgroundColor']
  backgroundImage: GameRoomConfig['backgroundImage']
  backgroundMusic: GameRoomConfig['backgroundMusic']

  initialized = false
  objects: GameObject[]

  constructor(config: GameRoomConfig) {
    this.width = config.width
    this.height = config.height

    this.backgroundColor = config.backgroundColor
    this.backgroundImage = config.backgroundImage
    this.backgroundMusic = config.backgroundMusic

    this.objects = []

    this.create = this.create.bind(this)

    this.instanceCreate = this.instanceCreate.bind(this)
    this.instanceCount = this.instanceCount.bind(this)
    this.instanceDestroy = this.instanceDestroy.bind(this)

    this.draw = this.draw.bind(this)
  }

  /**
   * Instantiates the room, creating all objects and setting the initialized flag to true.
   */
  create() {
    this.objects.forEach((object) => object.create())
    this.initialized = true
  }

  /**
   * Returns the number of instances of the object in the room.
   */
  instanceCount(object?: { name: string }) {
    return !object
      ? this.objects.length
      : this.objects.filter((o) => o.name === object.name).length
  }

  /**
   * Returns a random x position within the room.
   * @param [paddingLeft=0] - Percentage (0 - 1) or number of pixels.
   * @param [paddingRight=0] - Percentage (0 - 1) or number of pixels.
   */
  randomXPosition(paddingLeft: number = 0, paddingRight: number = 0): number {
    const pxLeft = paddingLeft * (paddingLeft < 1 ? this.width : 1)
    const pxRight = paddingRight * (paddingRight < 1 ? this.width : 1)

    const horizontalRange = this.width - pxLeft - pxRight

    return pxLeft + random(horizontalRange)
  }

  /**
   * @param [paddingTop=0] - Percentage (0 - 1) or number of pixels.
   * @param [paddingBottom=0] - Percentage (0 - 1) or number of pixels.
   */
  randomYPosition(paddingTop: number = 0, paddingBottom: number = 0): number {
    const pxTop = paddingTop * (paddingTop < 1 ? this.height : 1)
    const pxBottom = paddingBottom * (paddingBottom < 1 ? this.height : 1)

    const verticalRange = this.height - pxTop - pxBottom

    // TODO: avoid solid objects
    return pxTop + random(verticalRange)
  }

  /**
   * @param padding
   * @param padding.paddingTop - Percentage (0 - 1) or number of pixels.
   * @param padding.paddingBottom - Percentage (0 - 1) or number of pixels.
   * @param padding.paddingLeft - Percentage (0 - 1) or number of pixels.
   * @param padding.paddingRight - Percentage (0 - 1) or number of pixels.
   */
  randomPosition({
    paddingTop = 0,
    paddingBottom = 0,
    paddingLeft = 0,
    paddingRight = 0,
  }: {
    paddingTop?: number
    paddingBottom?: number
    paddingLeft?: number
    paddingRight?: number
  }): { x: number; y: number } {
    return {
      x: this.randomXPosition(paddingLeft, paddingRight),
      y: this.randomYPosition(paddingTop, paddingBottom),
    }
  }

  /**
   * Returns true if an instance of the object exists in the room.
   */
  instanceExists(instance: GameObject) {
    return this.objects.some((o) => o.name === instance.name)
  }

  /**
   * Creates an instance of the GameObject in the room at the specified position.
   * If no position is provided, the object will be created at a random position.
   */
  instanceCreate<T extends GameObject = GameObject>( // TODO: infer type from klass
    klass: { new (): T },
    x: number = this.randomXPosition(),
    y: number = this.randomYPosition(),
  ) {
    const object = new klass()
    object.x = x
    object.y = y

    this.objects.push(object)

    // Instances created during run-time need to have their create() event fired.
    // We do this AFTER the constructor and AFTER pushing it to the room objects so that
    // the object's event has access to the full state of the room (including itself).
    // The constructor instantiation time cannot provide for this.
    object.create()

    return object
  }

  /**
   * Destroys the instance of the object in the room.
   */
  instanceDestroy(instance: GameObject) {
    const index = this.objects.findIndex((o) => o === instance)

    // TODO: get rid of events property and just use methods on the object.
    //       also use on* naming convention for events.
    instance.destroy()
    this.objects[index]?.events?.destroy?.(instance)
    this.objects.splice(index, 1)
  }

  /**
   * This method should draw the room. Called on every tick of the loop.
   */
  draw(drawing: GameDrawing) {
    if (this.backgroundColor) {
      drawing.setFillColor(this.backgroundColor)
      drawing.rectangle(0, 0, this.width, this.height)
    }

    if (this.backgroundImage) {
      drawing.image(this.backgroundImage)
    }
  }
}

window.biteWood = window.biteWood || {}
window.biteWood.GameRoom = GameRoom

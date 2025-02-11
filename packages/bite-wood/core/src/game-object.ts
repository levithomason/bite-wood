import { offsetX, offsetY } from './math.js'
import { Vector } from './vector.js'

import { gameKeyboard } from './game-keyboard-controller.js'
import { gameMouse } from './game-mouse-controller.js'
import { gamePhysics } from './game-physics-controller.js'
import { gameState } from './game-state-controller.js'
import { gameRooms } from './game-rooms.js'
import { GameSprite } from './game-sprite.js'
import { GameDrawing } from './game-drawing.js'

export type GameObjectConfig = {
  // TODO: use a key for custom properties so we don't have to lose type safety
  [key: string]: any

  states?: GameObject['states']
  boundingBoxTop?: GameObject['boundingBoxTop']
  boundingBoxLeft?: GameObject['boundingBoxLeft']
  boundingBoxWidth?: GameObject['boundingBoxWidth']
  boundingBoxHeight?: GameObject['boundingBoxHeight']
  persist?: GameObject['persist']
  sprite?: GameObject['sprite']
  solid?: GameObject['solid']
  x?: GameObject['x']
  y?: GameObject['y']
  acceleration?: GameObject['acceleration']
  gravity?: GameObject['gravity']
  friction?: GameObject['friction']
  speed?: GameObject['speed']
  direction?: GameObject['direction']
  events?: GameObject['events']
}

export type GameObjectAction = (self: GameObject) => void
export type GameDrawingAction = (gameDrawing: GameDrawing) => void

interface GameObjectEvents {
  create?: GameObjectAction
  destroy?: GameObjectAction
  draw?: GameDrawingAction
  keyActive?: { [key: string]: GameObjectAction }
  keyDown?: { [key: string]: GameObjectAction }
  keyUp?: { [key: string]: GameObjectAction }
  mouseActive?: { [button: string]: GameObjectAction }
  mouseDown?: { [button: string]: GameObjectAction }
  mouseUp?: { [button: string]: GameObjectAction }
  step?: GameObjectAction
}

export type GameObjectStates<TGameObject = GameObject> = {
  [key: string]: GameObjectState<TGameObject>
}

export type GameObjectState<TGameObject = GameObject> = {
  enter?: (self: TGameObject) => void
  step?: (self: TGameObject) => void
}

export class GameObject {
  // TODO: use a key for custom properties so we don't have to lose type safety
  [key: string]: any

  /**
   * States provide a way to organize and manage your object's sprites and behaviors.
   * An object is in one state at a time, which can be set using this.setState(state).
   *
   * The first state listed in states is set during object construction.
   * Otherwise, state is the latest value set by setState().
   *
   * The state can be set using this.setState(state).
   * You can get the current state with this.getState().
   */
  states?: GameObjectStates
  #state?: string

  /** The bounding box's distance away from the object's y position. */
  #boundingBoxWidth: number
  /** The bounding box's distance away from the object's x position. */
  #boundingBoxHeight: number
  /** How wide the bounding box starting from boundingBoxLeft. */
  #boundingBoxLeft: number
  /** How tall the bounding box starting from boundingBoxTop. */
  #boundingBoxTop: number
  /** Determines whether this object should still exist when the room changes. */
  persist: boolean
  sprite?: GameSprite
  solid: boolean
  x: number
  y: number
  acceleration: number
  friction: number
  gravity: Vector
  events: GameObjectEvents

  #vector: Vector

  /** An array of all instantiated game objects. */
  static instances: GameObject[] = []

  // TODO: introduce object ids, replace instance equality checks
  // id = uuidv4()
  constructor(config: GameObjectConfig) {
    const {
      states,
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
    this.#vector = new Vector(
      offsetX(this.x, speed, direction),
      offsetY(this.y, speed, direction),
    )
    this.events = events

    // assign any custom properties the developer passed in
    Object.keys(properties).forEach((property) => {
      if (property in this) {
        const message = `Cannot create ${this.name} with property ${property} because it is already defined by GameObject.`
        throw new Error(message)
      }
      this[property] = properties[property]
    })

    this.create = this.create.bind(this)
    this.moveTo = this.moveTo.bind(this)
    this.move = this.move.bind(this)
    this.motionAdd = this.motionAdd.bind(this)
    this.setSprite = this.setSprite.bind(this)
    this.step = this.step.bind(this)
    this.draw = this.draw.bind(this)
    this.isOutsideRoom = this.isOutsideRoom.bind(this)

    //
    // States
    // After the object is initialized above, enter the first state.
    //
    // TODO: add tests for states behavior
    if (states) {
      this.states = states
      const firstState = Object.keys(this.states)[0]

      // TypeScript requires state to be assigned in the constructor for the
      // property to be definitely defined. We cannot use setState(), so we dupe it.
      this.setState(firstState)
    }

    GameObject.instances.push(this)
  }

  get name() {
    return this.constructor.name
  }

  get speed() {
    return this.#vector.magnitude
  }

  set speed(speed) {
    this.#vector.magnitude = speed
  }

  get hspeed() {
    return this.#vector.x
  }

  set hspeed(hspeed) {
    this.#vector.x = hspeed
  }

  get vspeed() {
    return this.#vector.y
  }

  set vspeed(vspeed) {
    this.#vector.y = vspeed
  }

  get direction() {
    return this.#vector.direction
  }

  set direction(direction) {
    this.#vector.direction = direction
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
   * The x offset of the object's insertion point relative to the top left corner of the bounding box.
   * @return {number}
   */
  get insertionX(): number {
    if (this.sprite) return this.sprite.insertionX
    return -this.#boundingBoxLeft
  }

  /**
   * The y offset of the object's insertion point relative to the top left corner of the bounding box.
   * @return {number}
   */
  get insertionY(): number {
    if (this.sprite) return this.sprite.insertionY
    return -this.#boundingBoxTop
  }

  /**
   * This is the current sprite's top position in the room.
   * Returns 0 if there is no sprite.
   * @return {number}
   */
  get spriteTop(): number {
    if (!this.sprite) return 0
    return this.y - this.sprite.insertionY
  }
  /**
   * This is the current sprite's left position in the room.
   * Returns 0 if there is no sprite.
   * @return {number}
   */
  get spriteLeft(): number {
    if (!this.sprite) return 0
    return this.x - this.sprite.insertionX
  }
  /**
   * This is the current sprite's right position in the room.
   * Returns 0 if there is no sprite.
   * @return {number}
   */
  get spriteRight(): number {
    if (!this.sprite) return 0
    return this.spriteLeft + this.sprite.width
  }
  /**
   * This is the current sprite's bottom position in the room.
   * Returns 0 if there is no sprite.
   */
  get spriteBottom(): number {
    if (!this.sprite) return 0
    return this.spriteTop + this.sprite.height
  }

  // events

  /**
   * Called when this object has registered a collision.
   */
  onCollision(other: GameObject) {}

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

  moveTo(x: number, y: number) {
    // TODO: Make get/set for x,y (#x,#y) and track xPrev, yPrev
    //       This is not the same as applying the vector in reverse, since,
    //       it is possible to update the vector then check xPrev, yPrev and get
    //       the wrong values. We want real world last x,y
    this.x = x
    this.y = y
  }

  move(direction: number, distance: number) {
    this.x = offsetX(this.x, distance, direction)
    this.y = offsetY(this.y, distance, direction)
  }

  motionAdd(direction: number, speed: number) {
    this.#vector.add(direction, speed)
  }

  setSprite(sprite: GameSprite) {
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
    Object.keys(gameKeyboard.down).forEach((key) => {
      this.events.keyDown?.[key]?.(this)
    })

    // keyActive
    Object.entries(gameKeyboard.active).forEach(([key, value]) => {
      if (value) this.events.keyActive?.[key]?.(this)
    })

    // keyUp
    Object.entries(gameKeyboard.up).forEach(([key, value]) => {
      if (value) this.events.keyUp?.[key]?.(this)
    })

    // mouseDown
    Object.entries(gameMouse.down).forEach(([key, value]) => {
      if (value) this.events.mouseDown?.[key]?.(this)
    })

    // mouseActive
    Object.entries(gameMouse.active).forEach(([button, value]) => {
      if (value) this.events.mouseActive?.[button]?.(this)
    })

    // mouseUp
    Object.entries(gameMouse.up).forEach(([button, value]) => {
      if (value) this.events.mouseUp?.[button]?.(this)
    })

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

    //
    // States
    //
    this.getState()?.step?.call(this, this)
  }

  /**
   * This method should draw the object. Called on every tick of the loop.
   */
  draw(drawing: GameDrawing) {
    if (this.sprite) {
      drawing.sprite(this.sprite, this.x, this.y)
    }

    if (gameState.isPlaying) {
      this.events?.draw?.(drawing)
    }
  }

  // TODO: this (like step collision check) needs bounding box apart from the sprite
  //       see step physics regarding staying outside solid objects
  isOutsideRoom(): boolean {
    if (!gameRooms.currentRoom) return false

    return (
      this.x < 0 ||
      this.y < 0 ||
      this.x > gameRooms.currentRoom.width ||
      this.y > gameRooms.currentRoom.height
    )
  }

  /**
   * Keep the object in the room.
   * Optionally `bounce` off the walls and define `padding` to keep away from the edges.
   *
   * @param [bounce=0] - How much to bounce when hitting the walls. 0 = stop, 1 = full bounce.
   * @param [padding={}] - Number of pixels to keep away from the top of the room.
   * @param [padding.top=0] - Number of pixels to keep away from the top of the room.
   * @param [padding.right=0] - Number of pixels to keep away from the right of the room.
   * @param [padding.bottom=0] - Number of pixels to keep away from the bottom of the room.
   * @param [padding.left=0] - Number of pixels to keep away from the left of the room.
   *
   * @example
   * // Bounce off the walls with 100% of the original speed
   * this.bounceOffRoom(1)
   * @example
   * // Bounce off the walls with 50% of the original speed
   * this.bounceOffRoom(0.5)
   * @example
   * // Stop when hitting walls, 0% of the original speed.
   * this.bounceOffRoom(0)
   * this.bounceOffRoom()
   * @example
   * // Stop at the walls, but keep 50px away from the bottom.
   * this.bounceOffRoom(0, { bottom: 50 })
   */
  keepInRoom(
    bounce: number = 0,
    padding: {
      top?: number
      right?: number
      bottom?: number
      left?: number
    } = {},
  ) {
    const { top = 0, right = 0, bottom = 0, left = 0 } = padding
    const room = gameRooms.currentRoom

    // TODO: how to handle the case where this is called when there is no room?
    if (!room) return

    // TODO: objects are getting stuck on the edges of the room

    // outside left
    if (this.boundingBoxLeft < left) {
      this.hspeed = Math.abs(this.hspeed) * bounce
      this.x = left + this.insertionX
    }
    // outside right
    else if (this.boundingBoxRight > room.width - right) {
      this.hspeed = -Math.abs(this.hspeed) * bounce
      this.x = room.width - right - this.boundingBoxWidth + this.insertionX
    }

    // outside top
    if (this.boundingBoxTop < top) {
      this.vspeed = Math.abs(this.vspeed) * bounce
      this.y = top + this.insertionY
    }
    // outside bottom
    else if (this.boundingBoxBottom > room.height - bottom) {
      this.vspeed = -Math.abs(this.vspeed) * bounce
      this.y = room.height - bottom - this.boundingBoxHeight + this.insertionY
    }
  }

  //
  // States
  //

  /**
   * Returns the current state of the object or null if there is no state.
   * Set the state using this.setState(state).
   */
  getState(): GameObjectState | null {
    if (!this.states) return null
    if (!this.#state) return null

    return this.states[this.#state] || null
  }

  /**
   * Set the state of the object to one of the states defined in the states property.
   */
  setState(state: string) {
    if (!this.states) {
      const message = `${this.name} cannot setState("${state}") because it has no states.`
      throw new Error(message)
    }

    if (!(state in this.states)) {
      const states = Object.keys(this.states)
      const message = `${this.name} cannot setState("${state}"), state does not exist in states: ${states}`
      throw new Error(message)
    }

    // If the state is already set, do nothing
    const didChange = this.#state !== state
    if (!didChange) return

    console.log(`${this.name} setState("${state}")`)

    // change state
    this.#state = state
    // TODO: state.exit()? before/after enter/exit?
    this.states[this.#state].enter?.call(this, this)
  }
}

window.biteWood = window.biteWood || {}
window.biteWood.GameObject = GameObject

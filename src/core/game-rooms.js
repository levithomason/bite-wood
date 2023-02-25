import { clamp } from './math.js'
import { gameDrawing } from './game-drawing-controller.js'

class GameRooms {
  /** @type GameRoom[] */
  #rooms = []

  /** @type number */
  #roomIndex = -1

  #fitCanvasToWindow() {
    if (!this.currentRoom) return

    const width = Math.min(window.innerWidth, this.currentRoom.width)
    const height = Math.min(window.innerHeight, this.currentRoom.height)
    gameDrawing.setCanvasSize(width, height)
  }

  constructor() {
    // Keep the canvas the same size as the window
    window.addEventListener('resize', () => this.#fitCanvasToWindow())
  }

  /**
   * @returns GameRoom|undefined
   */
  get currentRoom() {
    return this.#rooms[this.#roomIndex]
  }

  /**
   * Removes all rooms from the list.
   */
  clearRooms() {
    this.#rooms = []
    this.setRoomIndex(-1)
  }

  /**
   * Adds the room to the game's list of rooms.
   * If this is the only room in the list, it is made the currentRoom.
   * @param {GameRoom} room
   */
  addRoom(room) {
    this.#rooms.push(room)

    if (this.#rooms.length === 1) {
      this.setRoomIndex(0)
    }
  }

  /**
   * Returns true if the room changed.
   * @param {number} index
   * @returns {boolean}
   */
  setRoomIndex(index) {
    const nextIndex = clamp(index, -1, this.#rooms.length - 1)

    const didChange = nextIndex !== this.#roomIndex
    if (!didChange) return false

    const hasNextRoom = this.#rooms[nextIndex]
    if (!hasNextRoom) return false

    // Current room:
    // - Collect all objects that should persist to the next room
    // - Stop background music
    // New room:
    // - Create the room if it hasn't been created yet
    // - Add the persisted objects to the new room
    // - Start background music
    // - Fit the canvas to the window

    const persistedObjects = []
    if (this.currentRoom) {
      this.currentRoom.objects = this.currentRoom.objects.filter((object) => {
        if (object.persist) persistedObjects.push(object)

        return !object.persist
      })

      if (this.currentRoom.backgroundMusic) {
        this.currentRoom.backgroundMusic.pause()
      }
    }

    this.#roomIndex = nextIndex

    if (!this.currentRoom.initialized) this.currentRoom.create()

    this.currentRoom.objects = this.currentRoom.objects.concat(persistedObjects)

    if (this.currentRoom.backgroundMusic) {
      this.currentRoom.backgroundMusic.loop = true
      this.currentRoom.backgroundMusic.playOne()
    }

    this.#fitCanvasToWindow()

    return true
  }

  /**
   * Returns true if the room changed.
   * @returns {boolean}
   */
  nextRoom() {
    // prevent going out of range
    if (this.isLastRoom()) return false

    return this.setRoomIndex(this.#roomIndex + 1)
  }

  /**
   * Returns true if the room changed.
   * @returns {boolean}
   */
  prevRoom() {
    // prevent going out of range
    if (this.isFirstRoom()) return false

    return this.setRoomIndex(this.#roomIndex - 1)
  }

  /** @returns {boolean} */
  isFirstRoom() {
    return this.#roomIndex === 0
  }

  /** @returns {boolean} */
  isLastRoom() {
    return this.#roomIndex === this.#rooms.length - 1
  }
}

export const gameRooms = new GameRooms()
window.biteWood = window.biteWood || {}
window.biteWood.gameRooms = gameRooms

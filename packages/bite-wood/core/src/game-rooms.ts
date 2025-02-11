import { clamp } from './math.js'
import { gameDrawing } from './game-drawing-controller.js'
import { GameObject } from './game-object.js'
import { GameRoom } from './game-room.js'

class GameRooms {
  #rooms: GameRoom[] = []
  #roomIndex: number = -1

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

  get currentRoom(): GameRoom | null {
    return this.#rooms[this.#roomIndex] || null
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
   * @param room
   */
  addRoom(room: GameRoom) {
    this.#rooms.push(room)

    if (this.#rooms.length === 1) {
      this.setRoomIndex(0)
    }
  }

  /**
   * Returns true if the room index changed.
   * @param index
   */
  setRoomIndex(index: number): boolean {
    // prevent going out of range
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

    const persistedObjects: GameObject[] = []
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

    if (this.currentRoom) {
      if (!this.currentRoom.initialized) this.currentRoom.create()

      this.currentRoom.objects =
        this.currentRoom.objects.concat(persistedObjects)

      if (this.currentRoom.backgroundMusic) {
        this.currentRoom.backgroundMusic.loop = true
        this.currentRoom.backgroundMusic.playOne()
      }
    }

    this.#fitCanvasToWindow()

    return true
  }

  /**
   * Returns true if the room changed.
   */
  nextRoom(): boolean {
    return this.setRoomIndex(this.#roomIndex + 1)
  }

  /**
   * Returns true if the room changed.
   */
  prevRoom(): boolean {
    return this.setRoomIndex(this.#roomIndex - 1)
  }

  isFirstRoom(): boolean {
    return this.#roomIndex === 0
  }

  isLastRoom(): boolean {
    return this.#roomIndex === this.#rooms.length - 1
  }
}

export const gameRooms = new GameRooms()

window.biteWood = window.biteWood || {}
window.biteWood.gameRooms = gameRooms

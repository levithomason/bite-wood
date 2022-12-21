import { clamp } from './math.js'

class GameRooms {
  /** @type GameRoom[] */
  #rooms = []

  /** @type number */
  #roomIndex = -1

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
   * If this is the only room in the list, it is made the active game.room.
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

    if (didChange) {
      const persistedObjects = []

      if (this.currentRoom) {
        this.currentRoom.objects = this.currentRoom.objects.filter(object => {
          if (object.persist) persistedObjects.push(object)

          return !object.persist
        })

        if (this.currentRoom.backgroundMusic) {
          this.currentRoom.backgroundMusic.pause()
        }
      }

      this.#roomIndex = nextIndex

      if (this.currentRoom) {
        if (!this.currentRoom.initialized) {
          this.currentRoom.init()
        }
        this.currentRoom.objects = this.currentRoom.objects.concat(
          persistedObjects,
        )
        if (this.currentRoom.backgroundMusic) {
          this.currentRoom.backgroundMusic.play()
        }
      }
    }

    return didChange && !!this.currentRoom
  }

  /**
   * Returns true if the room changed.
   * @returns {boolean}
   */
  nextRoom() {
    return this.setRoomIndex(this.#roomIndex + 1)
  }

  /**
   * Returns true if the room changed.
   * @returns {boolean}
   */
  prevRoom() {
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

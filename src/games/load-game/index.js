import {
  Game,
  GameObject,
  gamePhysics,
  GameRoom,
  gameRooms,
} from '../../core/index.js'

/**
 * @typedef {Object} GameFile
 * @property {string} name
 * @property {Object.<string, {config: GameObjectConfig, draw: TODO }>} objects
 * @property {Object.<string, GameRoomConfig>} rooms
 */
const gameFile = {
  name: 'My Game',

  objects: {
    Player: {
      config: {
        boundingBoxTop: -40,
        boundingBoxLeft: -20,
        boundingBoxWidth: 40,
        boundingBoxHeight: 60,

        acceleration: gamePhysics.friction * 5,
        friction: gamePhysics.friction,

        // TODO: Look at Apple and move action creators to top level
        //       then use them here to resolve JSON actions for events.
        //       Also, probably remove "events" from GameObject and just implement
        //       the events in the object classes.
        events: {
          step: (self) => {
            self.speed *= 1 - self.friction
          },
          keyActive: {
            ARROWRIGHT: (self) => {
              self.motionAdd(gamePhysics.DIRECTION_RIGHT, self.acceleration)
            },
            ARROWLEFT: (self) => {
              self.motionAdd(gamePhysics.DIRECTION_LEFT, self.acceleration)
            },
            ARROWUP: (self) => {
              self.motionAdd(gamePhysics.DIRECTION_UP, self.acceleration)
            },
            ARROWDOWN: (self) => {
              self.motionAdd(gamePhysics.DIRECTION_DOWN, self.acceleration)
            },
          },
        },
      },
      draw: [
        // draw a stick figure
        [{}, 'setFillColor', 'white'],
        // head
        [{ relative: true }, 'circle', 0, -30, 10],
        // body
        [{}, 'setLineWidth', 10],
        [{}, 'setLineCap', 'round'],
        [{}, 'setStrokeColor', 'white'],
        [{ relative: true }, 'line', 0, 0, 0, -25], // torso
        [{}, 'setLineWidth', 7],
        [{ relative: true }, 'line', 0, -10, -15, -20], // left arm
        [{ relative: true }, 'line', 0, -10, 15, -20], // right arm
        [{}, 'setLineWidth', 8],
        [{ relative: true }, 'line', 0, 0, -15, 15], // left leg
        [{ relative: true }, 'line', 0, 0, 15, 15], // right leg
      ],
    },
  },

  rooms: {
    Room1: {
      config: {
        width: 800,
        height: 600,
        backgroundColor: '#333',
      },
      objects: [{ name: 'Player', x: 400, y: 300 }],
    },
  },
}

const createGameFromJSON = (gameFile) => {
  const objectClasses = {}

  Object.entries(gameFile.objects).forEach(([objectName, objectFile]) => {
    objectClasses[objectName] = class ParsedGameObject extends GameObject {
      constructor() {
        super(objectFile.config)
      }

      draw(drawing) {
        super.draw(drawing)

        objectFile.draw.forEach(([opts, fn, ...args]) => {
          if (opts.relative) {
            drawing.moveCamera(-this.x, -this.y)
            drawing[fn](...args)
            drawing.moveCamera(this.x, this.y)
          } else {
            drawing[fn](...args)
          }
        })
      }
    }

    Object.defineProperty(objectClasses[objectName], 'name', {
      value: objectName,
    })
  })

  const roomClasses = {}

  Object.entries(gameFile.rooms).forEach(([roomName, roomFile]) => {
    roomClasses[roomName] = class extends GameRoom {
      constructor() {
        super(roomFile.config)

        roomFile.objects.forEach((objectConfig) => {
          const { name, x, y } = objectConfig

          this.instanceCreate(objectClasses[name], x, y)
        })
      }
    }

    gameRooms.addRoom(new roomClasses[roomName]())
  })

  return new Game()
}

const game = createGameFromJSON(gameFile)
game.start()

import * as collision from '../../../core/collision.js'
import {
  GameAudio,
  GameImage,
  GameObject,
  GameSprite,
  gameRooms,
} from '../../../core/index.js'
import * as math from '../../../core/math.js'

// ----------------------------------------
// Player
// ----------------------------------------
const sprApple = new GameSprite({
  image: new GameImage(`../run-unicorn-run/images/apple.png`),
  scaleX: 2,
  scaleY: 2,
  frameCount: 1,
  frameWidth: 11,
  frameHeight: 12,
  insertionX: 5,
  insertionY: 12,
})

const sndEatApple = new GameAudio(
  '../run-unicorn-run/sounds/20269__koops__apple-crunch-06.wav',
)

/**
 * Evaluates action parameter values and invokes action.
 *
 * @param {function} cb
 * @param {object} opts
 * @param {boolean} opts.eval - Whether to eval action values.
 * @returns {function(*=): function(*=, *=): *}
 */
const createAction = (cb, opts = {}) => (params = {}) => (
  /** GameObject */ self,
) => {
  const evaluatedParams = Object.keys(params).reduce((acc, key) => {
    let value = params[key]

    // evaluate strings referencing 'self', math notation, and comparisons
    // allows the user to supply values like 'self.x + 4' or 'gameRooms.currentRoom.width'
    if (
      opts.eval !== false &&
      typeof value === 'string' &&
      (value === 'self' || /(?:[+\-*/^]+|\w\.\w|[><=])/gi.test(value))
    ) {
      try {
        value = eval(value)
      } catch (e) {
        console.warn('Cannot evaluate action param value:', value)
        console.error(e)
      }
    }

    acc[key] = value

    return acc
  }, {})

  // console.log('evaluatedParams', evaluatedParams)
  // console.groupEnd()

  cb(evaluatedParams, self)
}

const actions = {
  //
  // Variables
  //
  setVariableToRandom: createAction(({ name, min, max }, self) => {
    self[name] = math.random(max, min)
  }),

  //
  // Control Flow
  //
  if: createAction(({ condition, trueActions, falseActions }, self) => {
    if (condition) {
      resolveActions(trueActions).forEach(action => action(self))
    } else {
      resolveActions(falseActions).forEach(action => action(self))
    }
  }),

  ifCollisionObject: createAction(
    ({ other, trueActions, falseActions }, self) => {
      if (collision.objects(self, other)) {
        resolveActions(trueActions).forEach(action => action(self))
      } else {
        resolveActions(falseActions).forEach(action => action(self))
      }
    },
  ),

  //
  // Movement
  //
  moveTo: createAction(({ x, y }, self) => {
    self.x = x
    self.y = y
  }),

  moveToward: createAction(({ x, y, speed = 1 }, self) => {
    const direction = math.direction(self.x, self.y, self.startX, self.startY)

    self.motionAdd(direction, speed)
  }),

  moveToRandom: createAction(
    (
      { paddingTop = 0, paddingBottom = 0, paddingLeft = 0, paddingRight = 0 },
      self,
    ) => {
      const { x, y } = gameRooms.currentRoom.randomPosition({
        paddingTop,
        paddingBottom,
        paddingLeft,
        paddingRight,
      })

      self.x = x
      self.y = y
    },
  ),

  log: createAction(
    ({ value }) => {
      console.log(value)
    },
    { eval: false },
  ),

  //
  // Room
  //
  instanceDestroy: createAction(({ object }, self) => {
    // TODO: probably want destroySelf as an action, how to make actions with no params?
    gameRooms.currentRoom.instanceDestroy(object)
  }),

  //
  // Sound
  //
  soundPlay: createAction(({ name }) => {
    // TODO: need to play sounds by name somehow... organized resources into resource tree
    sndEatApple.play()
  }),
}

/**
 * Transforms an object of JSON actions into a function call.
 *
 * in : { moveTo: { x: 10, y: 20 } }
 * out: () => {
 *        actions.moveTo({ 10, 20 })
 *      }
 *
 * @param actionsObj
 * @returns {() => void}
 */
const resolveActions = (actionsObj = {}) => {
  const entries = Object.entries(actionsObj)

  return () => {
    entries.forEach(([name, params]) => {
      if (!actions[name]) {
        throw new Error(`resolveActions encountered unknown action: ${name}`)
      }

      return actions[name](params)
    })
  }
}

class Apple extends GameObject {
  static displayName = 'objApple'

  constructor() {
    super({
      sprite: sprApple,
      // x: x,
      // y: y,

      // TODO: this isn't being set because room.instanceCreate doesn't know
      //       that it needs to set x and y on instantiation.
      // so we can bounce around our starting point
      // startX: x,
      // startY: y,

      speed: 0.2,
      gravity: new math.Vector(0, 0),
      friction: 0.001,
      events: {
        create: resolveActions({
          setVariableToRandom: {
            name: 'direction',
            min: 180,
            max: 360,
          },
          moveToRandom: {
            paddingLeft: 0.25,
            paddingRight: 0.1,
            paddingTop: 0.5,
            paddingBottom: 0.1,
          },
        }),

        // collision: {
        //   objPlayer: {
        //     actions: {
        //       soundPlay: {
        //         name: 'sndEatApple',
        //       },
        //       instanceDestroy: {
        //         self: true,
        //       },
        //       ifInstanceCount: {
        //         name: 'objApple',
        //         equal: 0,
        //         true: {
        //           roomNext: {},
        //         },
        //       },
        //     },
        //   },
        // },

        step: resolveActions({
          moveToward: {
            x: 'self.startX',
            y: 'self.startY',
            speed:
              'Math.pow(math.distance(self.x, self.y, self.startX, self.startY), 3) * 0.001',
          },

          ifCollisionObject: {
            other: 'objPlayer',
            trueActions: {
              soundPlay: {
                name: 'sndEatApple',
              },
              instanceDestroy: {
                object: 'self',
              },
            },
          },

          //   // die on collision with player
          //   if (collision.objects(self, Player)) {
          //     sndEatApple.play()
          //     gameRooms.currentRoom.instanceDestroy(self)
          //
          //     // go to next room on all apples collected
          //     if (!gameRooms.currentRoom.instanceExists(Apple)) {
          //       gameRooms.nextRoom()
          //     }
          //   }
        }),
      },
    })
  }
}

window.Apple = Apple

export default Apple

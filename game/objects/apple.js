import * as collision from '../../core/collision.js'
import {
  GameAudio,
  GameImage,
  GameObject,
  GameSprite,
} from '../../core/game/index.js'
import * as utils from '../../core/math.js'

// ----------------------------------------
// Player
// ----------------------------------------
const sprApple = new GameSprite({
  image: new GameImage(`../game/images/apple.png`),
  scaleX: 2,
  scaleY: 2,
  frameCount: 1,
  frameWidth: 11,
  frameHeight: 12,
  insertionX: 5,
  insertionY: 12,
})

const sndEatApple = new GameAudio('../game/sounds/20269__koops__apple-crunch-06.wav')

/**
 * Evaluates action parameter values and invokes action.
 *
 * @param {function} cb
 * @param {object} opts
 * @param {boolean} opts.eval - Whether or not to eval action values.
 * @returns {function(*=): function(*=, *=): *}
 */
const createAction = (cb, opts = {}) => (params = {}) => (self, state) => {
  const evaluatedParams = Object.keys(params).reduce((acc, key) => {
    let value = params[key]

    // evaluate strings referencing 'self', 'state', math notation, and comparisons
    // allows the user to supply values like 'self.x + 4' or 'state.room.width'
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

  cb(evaluatedParams, self, state)
}

const actions = {
  //
  // Variables
  //
  setVariableToRandom: createAction(({ name, min, max }, self) => {
    self[name] = utils.random(max, min)
  }),

  //
  // Control Flow
  //
  if: createAction(({ condition, trueActions, falseActions }, self, state) => {
    if (condition) {
      resolveActions(trueActions).forEach(action => action(self, state))
    } else {
      resolveActions(falseActions).forEach(action => action(self, state))
    }
  }),

  ifCollisionObject: createAction(
    ({ other, trueActions, falseActions }, self, state) => {
      if (collision.objects(self, other)) {
        resolveActions(trueActions).forEach(action => action(self, state))
      } else {
        resolveActions(falseActions).forEach(action => action(self, state))
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
    const direction = utils.direction(self.x, self.y, self.startX, self.startY)

    self.motionAdd(direction, speed)
  }),

  moveToRandom: createAction(
    (
      { paddingTop = 0, paddingBottom = 0, paddingLeft = 0, paddingRight = 0 },
      self,
      state,
    ) => {
      const { x, y } = state.room.randomPosition({
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
  instanceDestroy: createAction(({ object }, self, state) => {
    // TODO: probably want destroySelf as an action, how to make actions with no params?
    state.room.instanceDestroy(object)
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
 * Transforms an object of JSON actions into an object of function actions:
 *
 * in : { moveTo: { x: 10, y: 20 } }
 * out: [actions.moveTo({ 10, 20 })]
 *
 * @param actionsObj
 * @returns {*[]}
 */
const resolveActions = (actionsObj = {}) => {
  return Object.keys(actionsObj).map(name => {
    const params = actionsObj[name]

    if (!actions[name]) {
      debugger
    }

    return actions[name](params)
  })
}

class Apple extends GameObject {
  static displayName = 'objApple'

  constructor({ x, y }) {
    super({
      sprite: sprApple,
      x: x,
      y: y,
      speed: 0.2,
      gravity: 0.01,
      friction: 0.001,
      events: {
        create: {
          actions: resolveActions({
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
        },

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

        step: {
          actions: resolveActions({
            moveToward: {
              x: 'self.startX',
              y: 'self.startY',
              speed:
                'Math.pow(utils.distance(self.x, self.y, self.startX, self.startY), 3) * 0.001',
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
          }),

          // [
          //   // die on collision with player
          //   self => {
          //     if (collision.objects(self, Player)) {
          //       sndEatApple.play()
          //       state.room.instanceDestroy(self)
          //
          //       // go to next room on all apples collected
          //       if (!state.room.instanceExists(Apple)) {
          //         state.nextRoom()
          //       }
          //     }
          //   },
          // ],
        },
      },
    })
  }
}

window.Apple = Apple

export default Apple

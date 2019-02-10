import { GameObject } from '../core/game/index.js'
import state from '../core/state.js'

import objPlayer from './player.js'

const objController = new GameObject({
  events: {
    mouseDown: {
      left: {
        actions: [
          self => {
            state.room.addObject(objPlayer)
          },
        ],
      },
    },
  },
})

export default objController

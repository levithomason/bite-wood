import { GameObject } from './game.js'
import physics from './physics.js'
import * as draw from './draw.js'

// ----------------------------------------
// Player
// ----------------------------------------
const objSolid = new GameObject({
  solid: true,
  x: 300,
  y: 535,
  width: 50,
  height: 50,
  maxSpeed: 0,
  acceleration: 0,
  gravity: 0,
  friction: 0,
  events: {
    draw: {
      actions: [
        self => {
          draw.saveSettings()
          draw.setBorderColor('orange')
          draw.setLineWidth(10)
          draw.setFillColor('transparent')
          draw.rectangle(self.x, self.y, self.width, self.height)
          draw.loadSettings()
        },
      ],
    },
  },
})

export default objSolid

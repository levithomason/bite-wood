import { gameCamera, GameDrawing, GameRoom, random } from '@bite-wood/core'

import { Box } from '../objects/box.js'
import { Ape } from '../objects/ape.js'
import { SnowParticles } from '../particles/snow-particles.js'

// =============================================================================
// Room
// =============================================================================

class Room0 extends GameRoom {
  player: Ape

  constructor() {
    super({ width: 1600, height: 900 })
    this.backgroundColor = '#94c0aa'

    const addBoxToRoom = (
      x = random(100, this.width - 100),
      y = random(150, this.height - 150),
    ) => {
      this.instanceCreate(Box, x, y)
    }
    for (let i = 0; i < 5; i += 1) {
      addBoxToRoom()
    }

    // create player
    this.player = this.instanceCreate(Ape, 100, 600)
    gameCamera.target = this.player
    const snow = this.instanceCreate(SnowParticles, 0, 0)
    // TODO: instance create is odd because it takes x/y, but no other properties
    //       we have to then set the emitterConfig width/height after instanceCreate
    //       reconsider how instances are created in rooms with certain properties
    snow.emitterConfig.width = this.width

    setTimeout(() => {
      setInterval(() => {
        if (this.instanceCount(Box) > 0) {
          addBoxToRoom()
        }
      }, 2000)
    }, 11000 /* after snow hits ground */)
  }

  draw(drawing: GameDrawing) {
    super.draw(drawing)

    if (this.instanceCount(Box) === 0) {
      // background
      drawing.setFillColor('#fff')
      drawing.rectangle(0, 0, this.width, this.height)

      // win screen
      drawing.setFillColor('#0a0')
      drawing.setFontSize(60)
      drawing.setTextAlign('center')
      drawing.text('YOU WIN!', this.width / 2, this.height / 2)
    }
  }
}

export const room0 = new Room0()

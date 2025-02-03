import { Box } from '../objects/box.js'
import { gameCamera } from '../../../core/game-camera-controller.js'
import { Ape } from '../objects/ape.js'
import { random } from '../../../core/math.js'
import { GameRoom } from '../../../core/index.js'
import { SnowParticles } from '../particles/snow-particles.js'

// =============================================================================
// Room
// =============================================================================

class Room0 extends GameRoom {
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
    snow.width = this.width

    setTimeout(() => {
      setInterval(() => {
        if (this.instanceCount(Box) > 0) {
          addBoxToRoom()
        }
      }, 2000)
    }, 11000 /* after snow hits ground */)
  }

  draw(drawing) {
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

// TODO: game.addRoom() should take the GameRoom class so we don't need to
//       pre-create all rooms like this. defer creation until the room is needed.
export const room0 = new Room0()

import * as collision from '../../core/collision.js'
import { GameImage, GameObject, GameSprite } from '../../core/game/index.js'
import state from '../../core/state.js'

// ----------------------------------------
// Player
// ----------------------------------------
const width = 100
const height = 78
const groundThickness = 50

const sprPlatform = new GameSprite({
  image: new GameImage(`../game/images/background.png`),
  frameCount: 1,
  frameWidth: width,
  frameHeight: height,
  offsetX: 90,
  offsetY: 600 - height,
  boundingBoxTop: groundThickness,
  boundingBoxHeight: height - groundThickness,
  insertionY: groundThickness,
})

class Platform extends GameObject {
  static displayName = 'objPlatform'

  constructor({ x, y }) {
    super({
      sprite: sprPlatform,
      x: x,
      y: y,
      maxSpeed: 0,
      acceleration: 0,
      solid: true,
      events: {
        draw: {
          actions: [
            (self, state, drawing) => {
              if (state.debug) {
                drawing.setLineWidth(4)
                drawing.setFillColor('transparent')
                drawing.setStrokeColor('magenta')
                drawing.rectangle(
                  self.x,
                  self.y,
                  self.sprite.boundingBoxWidth,
                  self.sprite.boundingBoxHeight,
                )
              }
            },
          ],
        },
      },
    })
  }
}

window.Platform = Platform

export default Platform

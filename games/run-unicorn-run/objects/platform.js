import {
  GameImage,
  GameObject,
  GameSprite,
  gameState,
} from '../../../core/index.js'

// ----------------------------------------
// Player
// ----------------------------------------
const width = 100
const height = 78
const groundThickness = 50

const sprPlatform = new GameSprite({
  image: new GameImage(`../run-unicorn-run/images/background.png`),
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
  static name = 'objPlatform'

  constructor() {
    super({
      sprite: sprPlatform,
      maxSpeed: 0,
      acceleration: 0,
      solid: true,
    })
  }

  draw(drawing) {
    super.draw(drawing)

    if (gameState.debug) {
      drawing
        .setLineWidth(4)
        .setFillColor('transparent')
        .setStrokeColor('magenta')
        .rectangle(
          this.x,
          this.y,
          this.sprite.boundingBoxWidth,
          this.sprite.boundingBoxHeight,
        )
    }
  }
}

export default Platform

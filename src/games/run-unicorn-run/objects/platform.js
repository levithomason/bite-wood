import { GameImage, GameObject, GameSprite } from '../../../core/index.js'

// ----------------------------------------
// Player
// ----------------------------------------
const width = 300
const height = 78
const groundThickness = 28

const imgPlatform = new GameImage(`../run-unicorn-run/images/background.png`)
await imgPlatform.loaded

const sprPlatform = new GameSprite(imgPlatform, {
  frameFirstX: 0,
  frameFirstY: 522,
  frameWidth: width,
  frameHeight: height,
  frameCount: 1,
  boundingBoxTop: height - groundThickness,
  boundingBoxHeight: groundThickness,
  insertionY: height - groundThickness,
})

class Platform extends GameObject {
  static name = 'objPlatform'

  constructor() {
    super({
      sprite: sprPlatform,
      collider: 'dynamic',
    })
  }
}

export default Platform

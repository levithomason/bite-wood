import {
  GameImage,
  GameObject,
  gameRooms,
  GameSprite,
} from '../../../core/index.js'

// ----------------------------------------
// RainbowDash
// ----------------------------------------
export const imgRainbowDashR = new GameImage(
  './../run-unicorn-run/images/my-littlepony-right.png',
)
await imgRainbowDashR.load()

const config = {
  frameFirstY: 1057,
  frameFirstX: -2,
  frameWidth: 95,
  frameHeight: 40,
  frameCount: 6,
  scaleX: 2,
  scaleY: 2,
  insertionX: 48,
  insertionY: 18,
  boundingBoxTop: 12,
  boundingBoxLeft: 27,
  boundingBoxHeight: 14,
  boundingBoxWidth: 67,
  stepsPerFrame: 4,
}
export const sprRainbowDashFlyR = new GameSprite(imgRainbowDashR, config)

export const sprRainbowDashFlyL = new GameSprite(imgRainbowDashR, {
  ...config,
  rtl: true,
})

class RainbowDash extends GameObject {
  static name = 'objRainbowDash'

  create() {
    super.create()

    this.x = 300
    this.y = 200
  }

  step() {
    super.step()

    if (this.x >= gameRooms.currentRoom.width) {
      this.setSprite(sprRainbowDashFlyL)
      this.hspeed = -this.hspeed
    } else if (this.x <= 0) {
      this.setSprite(sprRainbowDashFlyR)
      this.hspeed = -this.hspeed
    }
  }

  constructor() {
    super({
      sprite: sprRainbowDashFlyL,
      speed: 4,
      direction: 180,
    })
  }
}

export default RainbowDash

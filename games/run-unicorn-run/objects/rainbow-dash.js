import {
  GameImage,
  GameSprite,
  GameObject,
  gameRooms,
} from '../../../core/index.js'

// ----------------------------------------
// RainbowDash
// ----------------------------------------
export const imgRainbowDashR = new GameImage(
  './../run-unicorn-run/images/my-littlepony-right.png',
)

export const imgRainbowDashL = new GameImage(
  './../run-unicorn-run/images/my-littlepony-left.png',
)

export const sprRainbowDashFlyR = new GameSprite({
  image: imgRainbowDashR,
  frameCount: 6,
  frameWidth: 95,
  frameHeight: 40,
  offsetX: -2,
  offsetY: 1057,
  scaleX: 2,
  scaleY: 2,
  insertionX: 48,
  insertionY: 18,
  boundingBoxTop: 12,
  boundingBoxLeft: 27,
  boundingBoxHeight: 14,
  boundingBoxWidth: 67,
  stepsPerFrame: 4,
})

export const sprRainbowDashFlyL = new GameSprite({
  image: imgRainbowDashL,
  frameCount: 6,
  // TODO: do away with RTL once we have sprite edit ability
  // or we need to mirror frames
  rtl: true,
  frameWidth: 95,
  frameHeight: 40,
  offsetX: 1108,
  offsetY: 1057,
  scaleX: 2,
  scaleY: 2,
  insertionX: 48,
  insertionY: 18,
  boundingBoxTop: 12,
  boundingBoxLeft: 2,
  boundingBoxHeight: 14,
  boundingBoxWidth: 67,
  stepsPerFrame: 4,
})

class RainbowDash extends GameObject {
  static displayName = 'objRainbowDash'

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

window.RainbowDash = RainbowDash

export default RainbowDash

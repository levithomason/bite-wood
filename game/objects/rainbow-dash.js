import {
  GameImage,
  GameSprite,
  GameObject,
  gameRooms,
} from '../../core/game/index.js'

// ----------------------------------------
// RainbowDash
// ----------------------------------------
export const imgRainbowDashR = new GameImage(
  './../game/images/my-littlepony-right.png',
)

export const imgRainbowDashL = new GameImage(
  './../game/images/my-littlepony-left.png',
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

  constructor({ x = 300, y = 200 }) {
    super({
      sprite: sprRainbowDashFlyL,
      x: x,
      y: y,
      speed: 4,
      direction: 180,
      events: {
        create: {
          actions: [
            self => {
              self.x = 300
              self.y = 200
            },
          ],
        },
        step: {
          actions: [
            self => {
              if (self.x >= gameRooms.currentRoom.width) {
                self.setSprite(sprRainbowDashFlyL)
                self.hspeed = -self.hspeed
              } else if (self.x <= 0) {
                self.setSprite(sprRainbowDashFlyR)
                self.hspeed = -self.hspeed
              }
            },
          ],
        },
      },
    })
  }
}

window.RainbowDash = RainbowDash

export default RainbowDash

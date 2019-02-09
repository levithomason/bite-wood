import { GameImage, GameSprite, GameObject } from '../core/game/index.js'
import state from '../core/state.js'

// ----------------------------------------
// RainbowDash
// ----------------------------------------
export const imgRainbowDashR = new GameImage('./../images/my-littlepony-right.png')
export const imgRainbowDashL = new GameImage('./../images/my-littlepony-left.png')
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

const objRainbowDash = new GameObject({
  sprite: sprRainbowDashFlyL,
  x: 300,
  y: 200,
  speed: 4,
  direction: 180,
  friction: 0,
  gravity: 0,
  events: {
    step: {
      actions: [
        self => {
          if (self.x >= state.room.width) {
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

export default objRainbowDash

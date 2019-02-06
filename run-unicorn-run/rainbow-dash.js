import { GameImage, GameSprite, GameObject } from './game.js'

// ----------------------------------------
// RainbowDash
// ----------------------------------------
export const imgRainbowDashR = new GameImage('./my-littlepony-right.png')
export const imgRainbowDashL = new GameImage('./my-littlepony-left.png')
export const sprRainbowDashFlyR = new GameSprite({
  image: imgRainbowDashR.image,
  frameCount: 6,
  frameWidth: 95,
  frameHeight: 40,
  offsetX: -2,
  offsetY: 1057,
  scaleX: 2,
  scaleY: 2,
  insertionX: 48,
  insertionY: 18,
  stepsPerFrame: 4,
})
export const sprRainbowDashFlyL = new GameSprite({
  image: imgRainbowDashL.image,
  frameCount: 6,
  // TODO keep positive frame width values, add reverse flag instead
  frameWidth: -95,
  frameHeight: 40,
  offsetX: 1108,
  offsetY: 1057,
  scaleX: 2,
  scaleY: 2,
  insertionX: -48,
  insertionY: 18,
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
          if (self.x >= self.game.width) {
            self.setSprite(sprRainbowDashFlyL)
            self.y = Math.random() * 250 + 50
            self.hspeed = -Math.random() * 3 + 2
          } else if (self.x <= 0) {
            self.setSprite(sprRainbowDashFlyR)
            self.y = Math.random() * 250 + 50
            self.hspeed = Math.random() * 3 + 2
          }
        },
      ],
    },
  },
})

export default objRainbowDash

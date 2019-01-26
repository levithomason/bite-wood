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
  events: {
    step: {
      actions: [
        self => {
          if (self.x >= self.game.canvas.width + 300) {
            self.direction = 180
            self.y = Math.random() * 250 + 50
            self.speed = Math.random() * 3 + 1
            self.setSprite(sprRainbowDashFlyL)
          } else if (self.x <= -300) {
            self.direction = 0
            self.y = Math.random() * 250 + 50
            self.speed = Math.random() * 3 + 1
            self.setSprite(sprRainbowDashFlyR)
          }

          self.move(self.direction, self.speed)
        },
      ],
    },
  },
})

export default objRainbowDash

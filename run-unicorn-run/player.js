import { GameImage, GameSprite, GameObject } from './game.js'

// ----------------------------------------
// Player
// ----------------------------------------
export const imgPlayerR = new GameImage('./my-littlepony-right.png')
export const imgPlayerL = new GameImage('./my-littlepony-left.png')
export const sprPlayerIdleR = new GameSprite({
  image: imgPlayerR.image,
  frameCount: 16,
  frameWidth: 45,
  frameHeight: 46,
  offsetX: 0,
  offsetY: 543,
  scaleX: 2,
  scaleY: 2,
  insertionX: 24,
  insertionY: 46,
  stepsPerFrame: 8,
})
export const sprPlayerIdleL = new GameSprite({
  image: imgPlayerL.image,
  frameCount: 16,
  frameWidth: -45,
  frameHeight: 46,
  offsetX: 1106,
  offsetY: 543,
  scaleX: 2,
  scaleY: 2,
  insertionX: -24,
  insertionY: 46,
  stepsPerFrame: 8,
})
export const sprPlayerWalkR = new GameSprite({
  image: imgPlayerR.image,
  frameCount: 6,
  frameWidth: 48,
  frameHeight: 46,
  offsetX: 55,
  offsetY: 12,
  scaleX: 2,
  scaleY: 2,
  insertionX: 24,
  insertionY: 46,
  stepsPerFrame: 2,
})
export const sprPlayerWalkL = new GameSprite({
  image: imgPlayerL.image,
  frameCount: 6,
  frameWidth: -48,
  frameHeight: 46,
  offsetX: 1051,
  offsetY: 12,
  scaleX: 2,
  scaleY: 2,
  insertionX: -24,
  insertionY: 46,
  stepsPerFrame: 2,
})

const objPlayer = new GameObject({
  sprite: sprPlayerIdleR,
  x: 100,
  y: 573,
  speed: 4,
  events: {
    keyDown: {
      d: {
        actions: [self => (self.game.debug = !self.game.debug)],
      },
    },

    keyUp: {
      ArrowRight: {
        actions: [self => self.setSprite(sprPlayerIdleR)],
      },
      ArrowLeft: {
        actions: [self => self.setSprite(sprPlayerIdleL)],
      },
    },

    keyboard: {
      ArrowUp: {
        actions: [self => self.move(270, self.speed)],
      },
      ArrowDown: {
        actions: [self => self.move(90, self.speed)],
      },
      ArrowRight: {
        actions: [
          self => self.setSprite(sprPlayerWalkR),
          self => self.move(0, self.speed),
        ],
      },
      ArrowLeft: {
        actions: [
          self => self.setSprite(sprPlayerWalkL),
          self => self.move(180, self.speed),
        ],
      },
    },
  },
})

export default objPlayer

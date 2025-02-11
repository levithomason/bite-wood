export * from './game.js'
export * from './game-audio.js'
export * from './game-drawing.js'
export * from './game-image.js'
export * from './game-object.js'
export * from './game-keyboard.js'
export * from './game-mouse.js'
export * from './game-particles.js'
export * from './game-physics.js'
export * from './game-room.js'
export * from './game-sprite.js'

// TODO: controllers are mostly managers for single instances of classes like GameCamera
//       seems these should be part of some kind of game (or similar):
//       ```ts
//       const game = new Game()
//       game.camera // gameCamera === new GameCamera()
//       ```
//       Also, some controller files define both the class and instance in one file:
//        - game-state-controller.js
export * from './game-camera-controller.js'
export * from './game-drawing-controller.js'
export * from './game-keyboard-controller.js'
export * from './game-mouse-controller.js'
export * from './game-physics-controller.js'
export * from './game-rooms.js' // TODO: why is this not a controller?
export * from './game-state-controller.js'

export * from './math.js'
export * from './vector.js'

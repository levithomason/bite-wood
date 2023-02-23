import { GameAudio, GameImage, GameRoom } from '../../../core/index.js'

import Apple from '../objects/apple.js'
import Platform from '../objects/platform.js'
import Player from '../objects/player.js'
import RainbowDash from '../objects/rainbow-dash.js'
import Solid from '../objects/solid.js'

const imgBackground = new GameImage('../run-unicorn-run/images/background.png')
await imgBackground.loaded

export default class Room0 extends GameRoom {
  constructor() {
    super({ width: 800, height: 600 })

    this.backgroundImage = imgBackground

    this.backgroundMusic = new GameAudio(
      'https://soundimage.org/wp-content/uploads/2016/03/More-Monkey-Island-Band_Looping.mp3',
    )
    this.backgroundMusic.volume = 0.25
    this.backgroundMusic.loop = true
  }

  // TODO: the order of the create event doesn't make sense.
  // Every object.create should be called after the room is stable.
  // This way, every object has an opportunity to init user code with a stable and complete room.
  // Currently, instanceCreate calls object.create and this will happen sequentially, not after all objects are created.
  // A higher location (gameRooms/game) needs to be responsible for calling every object.create() after room init.
  /**
   * This method is called when the room is loaded in the game.
   * It should create all the objects the room needs.
   */
  create() {
    super.create()

    this.instanceCreate(Platform, 350, 450)

    this.instanceCreate(Apple)
    this.instanceCreate(Apple)
    this.instanceCreate(Apple)
    this.instanceCreate(Apple)
    this.instanceCreate(Apple)

    this.instanceCreate(Solid)
    this.instanceCreate(RainbowDash)

    this.instanceCreate(Player, 200, 600)
  }
}

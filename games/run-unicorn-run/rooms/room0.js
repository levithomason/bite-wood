import { GameAudio, GameImage, GameRoom } from '../../../core/index.js'

import Apple from '../objects/apple.js'
import Platform from '../objects/platform.js'
import Player from '../objects/player.js'
import RainbowDash from '../objects/rainbow-dash.js'
import Solid from '../objects/solid.js'

export default class Room0 extends GameRoom {
  constructor() {
    super(800, 600)

    this.backgroundImage = new GameImage(
      '../run-unicorn-run/images/background.png',
    )

    this.backgroundMusic = new GameAudio(
      'https://soundimage.org/wp-content/uploads/2016/03/More-Monkey-Island-Band_Looping.mp3',
    )
    this.backgroundMusic.volume = 0.25
    this.backgroundMusic.loop = true
  }

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

import { GameAudio, GameImage, GameRoom } from '../../core/game/index.js'

import Apple from '../objects/apple.js'
import Platform from '../objects/platform.js'
import Player from '../objects/player.js'
import RainbowDash from '../objects/rainbow-dash.js'
import Solid from '../objects/solid.js'

class Room0 extends GameRoom {
  constructor() {
    super()

    this.backgroundImage = new GameImage('../game/images/background.png')

    this.backgroundMusic = new GameAudio(
      'https://soundimage.org/wp-content/uploads/2016/03/More-Monkey-Island-Band_Looping.mp3',
    )
    this.backgroundMusic.volume = 0.25
    this.backgroundMusic.loop = true
  }

  init() {
    super.init()

    room0.instanceCreate(Platform, 350, 450)

    room0.instanceCreate(Apple)
    room0.instanceCreate(Apple)
    room0.instanceCreate(Apple)
    room0.instanceCreate(Apple)
    room0.instanceCreate(Apple)

    room0.instanceCreate(Solid)
    room0.instanceCreate(RainbowDash)

    room0.instanceCreate(Player, 100, 573)
  }
}

const room0 = new Room0()

window.room0 = room0

export default room0

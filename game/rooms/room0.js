import { GameAudio, GameImage, GameRoom } from '../../core/game/index.js'

import Apple from '../objects/apple.js'
import Player from '../objects/player.js'
import RainbowDash from '../objects/rainbow-dash.js'
import Solid from '../objects/solid.js'

class Room0 extends GameRoom {
  constructor() {
    super()

    this.backgroundImage = new GameImage('../game/images/background.png')

    this.backgroundMusic = new GameAudio(
      'http://soundimage.org/wp-content/uploads/2016/03/Monkey-Island-Band_Looping.mp3',
    )
    this.backgroundMusic.volume = 0.25
    this.backgroundMusic.loop = true
  }

  init() {
    super.init()

    room0.instanceCreate(Apple)
    room0.instanceCreate(Apple)
    room0.instanceCreate(Apple)
    room0.instanceCreate(Apple)
    room0.instanceCreate(Apple)
    // TODO: this throws DOMException when trying to execute `drawImage`
    //       maybe we don't handle objects with no image?
    room0.instanceCreate(Solid)
    room0.instanceCreate(RainbowDash)
    room0.instanceCreate(Player, 100, 573)
  }
}

const room0 = new Room0()

window.room0 = room0

export default room0

import { GameAudio, GameImage, GameRoom } from '../core/game/index.js'
import objPlayer from '../objects/player.js'
import objRainbowDash from '../objects/rainbow-dash.js'
import objSolid from '../objects/solid.js'

const room0 = new GameRoom()
room0.setBackgroundImage(new GameImage('../images/background.png'))
room0.setBackgroundMusic(
  new GameAudio(
    'http://soundimage.org/wp-content/uploads/2016/03/Monkey-Island-Band_Looping.mp3',
  ),
)
room0.addObject(objSolid)
room0.addObject(objRainbowDash)
room0.addObject(objPlayer)

window.room0 = room0

export default room0

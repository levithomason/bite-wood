import { GameAudio, GameRoom } from '../core/game/index.js'
import * as draw from '../core/draw.js'
import state from '../core/state.js'

import objPlayer from '../objects/player.js'

const room1 = new GameRoom()
room1.addObject(objPlayer)
room1.setBackgroundColor('#124')
room1.setBackgroundMusic(
  new GameAudio(
    'http://soundimage.org/wp-content/uploads/2017/05/Hypnotic-Puzzle.mp3',
  ),
)

room1.stars = []
room1.size = 4
room1.twinkle = 1
room1.density = 1 / 1000
room1.rate = 1 / 100
room1.draw = () => {
  const starCount = state.room.width * state.room.height * room1.density

  // add any new stars we need
  while (room1.stars.length < starCount) {
    room1.stars.push({
      x: Math.round(Math.random() * state.room.width),
      y: Math.round(Math.random() * Math.random() * state.room.height),
      r: 200 + Math.random() * 55,
      g: 200 + Math.random() * 55,
      b: 200 + Math.random() * 55,
      a: 0,
      size: Math.random() * room1.size,
      max: Math.random(),
      twinkle: Math.random() * room1.twinkle,
      rate: Math.random() * Math.random() * room1.rate,
      dying: false,
    })
  }

  room1.stars.forEach(star => {
    draw.setBorderColor('transparent')
    draw.setFillColor(`rgba(${star.r}, ${star.g}, ${star.b}, ${star.a})`)
    draw.rectangle(star.x, star.y, star.size, star.size)

    // grow in brightness then die
    if (star.dying) {
      star.a += -star.rate
    } else {
      star.a += star.rate * 2
      star.dying = star.a >= star.max
    }

    // twinkle color
    star.r = 127 + ((star.r + star.twinkle) % 127)
    star.g = 127 + ((star.g + star.twinkle) % 127)
    star.b = 127 + ((star.b + star.twinkle) % 127)
  })

  room1.stars = room1.stars.filter(star => {
    return !(star.dying && star.a < 0.01)
  })
}

window.room1 = room1

export default room1

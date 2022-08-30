import { GameAudio, GameRoom } from '../../core/game/index.js'
import state from '../../core/state.js'

class Room1 extends GameRoom {
  constructor() {
    super()
    this.backgroundColor = '#124'
    this.backgroundMusic = new GameAudio(
      'http://soundimage.org/wp-content/uploads/2017/05/Hypnotic-Puzzle.mp3',
    )
    this.backgroundMusic.volume = 0.2
    this.backgroundMusic.loop = true

    // custom properties
    this.stars = []
    this.size = 4
    this.twinkle = 1
    this.density = 1 / 1000
    this.rate = 1 / 200
  }

  draw(drawing) {
    super.draw(drawing)

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
        rate: room1.rate / 2 + (Math.random() * room1.rate - room1.rate / 2),
        dying: false,
      })
    }

    room1.stars.forEach(star => {
      drawing.setStrokeColor('transparent')
      drawing.setFillColor(`rgba(${star.r}, ${star.g}, ${star.b}, ${star.a})`)
      drawing.rectangle(star.x, star.y, star.size, star.size)

      // grow in brightness then die
      if (star.dying) {
        star.a += -star.rate
      } else {
        star.a += star.rate * 3
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
}

const room1 = new Room1()

window.room1 = room1

export default room1

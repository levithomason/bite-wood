import { GameAudio, GameRoom, gameRooms } from '../../core/game/index.js'

export default class Room1 extends GameRoom {
  constructor() {
    super(800, 600)
    this.backgroundColor = '#124'
    this.backgroundMusic = new GameAudio(
      'https://soundimage.org/wp-content/uploads/2017/05/Hypnotic-Puzzle.mp3',
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

    const starCount =
      gameRooms.currentRoom.width * gameRooms.currentRoom.height * this.density

    // add any new stars we need
    while (this.stars.length < starCount) {
      this.stars.push({
        x: Math.round(Math.random() * gameRooms.currentRoom.width),
        y: Math.round(
          Math.random() * Math.random() * gameRooms.currentRoom.height,
        ),
        r: 200 + Math.random() * 55,
        g: 200 + Math.random() * 55,
        b: 200 + Math.random() * 55,
        a: 0,
        size: Math.random() * this.size,
        max: Math.random(),
        twinkle: Math.random() * this.twinkle,
        rate: this.rate / 2 + (Math.random() * this.rate - this.rate / 2),
        dying: false,
      })
    }

    this.stars.forEach(star => {
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

    this.stars = this.stars.filter(star => {
      return !(star.dying && star.a < 0.01)
    })
  }
}

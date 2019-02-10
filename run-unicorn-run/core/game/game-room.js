export default class GameRoom {
  constructor(width = 800, height = 600) {
    this.width = width
    this.height = height
    this.objects = []

    this.addObject = this.addObject.bind(this)
    this.setBackgroundImage = this.setBackgroundImage.bind(this)
    this.setBackgroundMusic = this.setBackgroundMusic.bind(this)
  }

  /** @param {GameObject} object */
  addObject(object) {
    this.objects.push(object)
  }

  /** @param cssColor {string} */
  setBackgroundColor(cssColor) {
    this.backgroundColor = cssColor
  }

  /** @param image {GameImage} */
  setBackgroundImage(image) {
    this.backgroundImage = image
  }

  /** @param audio {GameAudio} */
  setBackgroundMusic(audio) {
    audio.loop = true
    audio.volume = 0.25
    this.backgroundMusic = audio
  }
}

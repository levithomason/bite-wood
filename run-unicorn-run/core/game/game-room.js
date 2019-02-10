export default class GameRoom {
  constructor(width = 800, height = 600) {
    this.width = width
    this.height = height
    this.objects = []

    this.init = this.init.bind(this)
    if (this.draw) this.draw = this.draw.bind(this)

    this.instanceCreate = this.instanceCreate.bind(this)
    this.instanceCount = this.instanceCount.bind(this)
    this.instanceDestroy = this.instanceDestroy.bind(this)

    this.setBackgroundColor = this.setBackgroundColor.bind(this)
    this.setBackgroundMusic = this.setBackgroundMusic.bind(this)
    this.setBackgroundImage = this.setBackgroundImage.bind(this)
  }

  init() {
    this.initialized = true
  }

  /** @param {GameObject} object */
  instanceCount(object) {
    return !object
      ? this.objects.length
      : this.objects.filter(o => o.displayName === object.displayName).length
  }

  /** @param {GameObject} object */
  instanceExists(object) {
    return this.objects.some(o => {
      return o.displayName === object.displayName
    })
  }

  /**
   * @param {number} x
   * @param {number} y
   * @param {GameObject} Constructor
   */
  instanceCreate(Constructor, x = this.width / 2, y = this.height / 2) {
    const object = new Constructor({ x, y })

    this.objects.push(object)
  }

  /** @param {GameObject} object */
  instanceDestroy(object) {
    const index = this.objects.findIndex(o => o === object)

    this.objects.splice(index, 1)
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

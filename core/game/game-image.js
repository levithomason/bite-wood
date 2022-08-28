export default class GameImage {
  constructor(src) {
    this.element = new Image()
    this.element.src = src

    this.handleLoad = this.handleLoad.bind(this)
    this.handleError = this.handleError.bind(this)

    this.element.onload = this.handleLoad.bind(this)
    this.element.onerror = this.handleError.bind(this)
  }

  get width() {
    return this.element.clientWidth
  }

  get height() {
    return this.element.clientHeight
  }

  handleLoad() {
    console.debug('GameImage loaded:', this.element.src)
  }

  handleError() {
    console.error('GameImage failed to load:', this.element.src)
  }
}

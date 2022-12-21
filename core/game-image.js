export class GameImage {
  constructor(src) {
    this.element = new Image()

    this.handleLoad = this.handleLoad.bind(this)
    this.handleError = this.handleError.bind(this)

    if (src) {
      this.element.src = src
      this.element.onload = this.handleLoad
      this.element.onerror = this.handleError
    }
  }

  get width() {
    return this.element.naturalWidth
  }

  get height() {
    return this.element.naturalHeight
  }

  handleLoad() {
    console.debug(
      `GameImage loaded, ${this.width}x${this.height},`,
      this.element.src,
    )
  }

  handleError() {
    console.error('GameImage failed to load:', this.element.src)
  }
}

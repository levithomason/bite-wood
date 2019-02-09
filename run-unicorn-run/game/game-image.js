export default class GameImage {
  constructor(src) {
    this.element = new Image()
    this.element.src = src
  }

  get width() {
    return this.element.clientWidth
  }

  get height() {
    return this.element.clientHeight
  }
}

export default class GameStage {
  constructor(width, height) {
    this.canvas = document.createElement('canvas')
    this.canvas.setAttribute('width', width)
    this.canvas.setAttribute('height', height)
    this.canvas.setAttribute('data-game-stage', 'true')
  }

  get width() {
    return this.canvas.width
  }

  get height() {
    return this.canvas.height
  }
}

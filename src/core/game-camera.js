export class GameCamera {
  constructor() {
    this.x = 0
    this.y = 0

    /**
     * @type {{x: number, y: number} | null}
     */
    this.target = null
  }
}

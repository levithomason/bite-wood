export class GameImage {
  /**
   * @type function
   * @param {*} [value]
   */
  #loadedResolve

  /** @type () => void */
  #loadedReject

  static get states() {
    return {
      PENDING: 0,
      LOADED: 1,
      FAILED: 2,
    }
  }

  /** @type boolean */
  #state = GameImage.states.PENDING

  constructor(src) {
    this.element = new Image()

    this.handleLoad = this.handleLoad.bind(this)
    this.handleError = this.handleError.bind(this)

    if (src) {
      this.element.src = src
      this.element.addEventListener('load', this.handleLoad)
      this.element.addEventListener('error', this.handleError)
    }

    this.loaded = new Promise((resolve, reject) => {
      this.#loadedResolve = resolve
      this.#loadedReject = reject
    })
  }

  /**
   * The natural width of the image.
   * @type number
   */
  get width() {
    if (this.#state !== GameImage.states.LOADED) {
      throw new Error('Tried to get width before image was done loading.')
    }
    return this.element.naturalWidth
  }

  /**
   * The natural height of the image.
   * @type number
   */
  get height() {
    if (this.#state !== GameImage.states.LOADED) {
      throw new Error('Tried to get height before image was done loading.')
    }
    return this.element.naturalHeight
  }

  handleLoad() {
    this.element.removeEventListener('load', this.handleLoad)
    this.#state = GameImage.states.LOADED
    console.debug(`GameImage loaded, ${this.width}x${this.height},`)
    this.#loadedResolve()
  }

  handleError() {
    this.element.removeEventListener('error', this.handleError)
    this.#state = GameImage.states.FAILED
    console.error('GameImage failed to load:')
    this.#loadedReject()
  }
}

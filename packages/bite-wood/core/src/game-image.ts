export class GameImage {
  element: HTMLImageElement

  readonly #src: string
  #state = GameImage.states.IDLE
  #loaded: boolean = false

  static get states() {
    return {
      IDLE: 0,
      LOADING: 1,
      LOADED: 2,
      FAILED: 3,
    }
  }

  constructor(src: string) {
    this.element = new Image()
    this.#src = src
    this.#state = GameImage.states.IDLE
  }

  /**
   * Loads the image and returns a promise.
   * If the image loads successfully, the promise resolves with the { event: Event }.
   * If the image fails to load, the promise rejects with the { event: ErrorEvent }.
   * If the image
   */
  async load(): Promise<{ event: Event | ErrorEvent | null }> {
    // early return if already loaded or failed
    if (this.#state !== GameImage.states.IDLE) {
      throw new Error(`GameImage.load() can only be called once: ${this.#src}`)
    }

    this.#state = GameImage.states.LOADING

    return new Promise((resolve, reject) => {
      const cleanup = () => {
        this.element.removeEventListener('load', handleLoad)
        this.element.removeEventListener('error', handleError)
      }

      const handleLoad = (event: Event) => {
        cleanup()
        this.#state = GameImage.states.LOADED
        console.debug(`GameImage loaded, ${this.width}x${this.height},`)
        this.#loaded = true
        resolve({ event })
      }

      const handleError = (event: ErrorEvent) => {
        cleanup()
        this.#state = GameImage.states.FAILED
        console.error('GameImage failed to load:', this.#src)
        this.#loaded = false
        reject({ event })
      }

      this.element.addEventListener('load', handleLoad)
      this.element.addEventListener('error', handleError)
      this.element.src = this.#src
    })
  }

  /**
   * Whether the image has been loaded.
   */
  get loaded() {
    return this.#loaded
  }

  /**
   * The natural width of the image.
   * @type number
   */
  get width(): number {
    if (this.#state !== GameImage.states.LOADED) {
      throw new Error(
        `Tried to get width before image was done loading: ${this.#src}.`,
      )
    }
    return this.element.naturalWidth
  }

  /**
   * The natural height of the image.
   * @type number
   */
  get height(): number {
    if (this.#state !== GameImage.states.LOADED) {
      throw new Error(
        `Tried to get height before image was done loading: ${this.#src}.`,
      )
    }
    return this.element.naturalHeight
  }
}

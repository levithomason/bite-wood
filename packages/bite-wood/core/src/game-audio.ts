export class GameAudio {
  private element: HTMLAudioElement

  constructor(src: string) {
    this.element = new Audio(src)

    this.playOne = this.playOne.bind(this)
    this.pause = this.pause.bind(this)
  }

  #handlePlayError(error: string) {
    switch (error) {
      case 'NotAllowedError':
        console.error(`Can't play audio, try implementing a "play" button.`)
        break
      case 'NotSupportedError':
        console.error(`Can't play audio, unsupported media format.`)
        break
      default:
        console.error(`Unknown error playing audio: ${error}`)
        break
    }
  }

  /** @type boolean */
  get loop() {
    return this.element.loop
  }

  set loop(val) {
    this.element.loop = val
  }

  get volume() {
    return this.element.volume
  }

  set volume(val) {
    this.element.volume = val
  }

  playOne() {
    if (!this.element.paused) return

    this.element.play().catch(this.#handlePlayError)
  }

  playMany() {
    // allow playing this sound multiple times at once
    const clone = new Audio(this.element.src)
    clone.volume = this.element.volume
    clone
      .play()
      .catch(this.#handlePlayError)
      .finally(() => clone.remove())
  }

  pause() {
    if (this.element.paused) return

    this.element.pause()
  }
}

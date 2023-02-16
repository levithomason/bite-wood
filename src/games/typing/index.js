import {
  Game,
  GameAudio,
  gameKeyboard,
  GameObject,
  GameParticles,
  GameRoom,
  gameRooms,
} from '../../core/index.js'
import { direction, randomChoice } from '../../core/math.js'

const sndPop = new GameAudio('./sounds/pop.m4a')
const sndPop2 = new GameAudio('./sounds/pop2.m4a')
const sndMiss = new GameAudio('./sounds/miss.m4a')

class KeyDestroyParticles extends GameParticles {
  constructor() {
    super({
      count: 5,
      rate: 0,
      speed: 15,
      friction: 0.15,
      // gravity: new Vector(0, 0.4),
      size: 10,
      color: '#fff',
      life: 500,
      shape: 'circle',
    })
  }
}

class Key extends GameObject {
  constructor() {
    super({
      boundingBoxTop: -20,
      boundingBoxLeft: -20,
      boundingBoxWidth: 40,
      boundingBoxHeight: 40,
    })

    this.speed = 1
    this.direction = direction(this.x, this.y, 400, 300)
  }

  step() {
    super.step()
    this.keepInRoom(1)
  }

  draw(drawing) {
    super.draw(drawing)

    drawing.setLineWidth(3)
    drawing.setStrokeColor('#000')
    drawing.setFillColor('#fff')
    drawing.rectangle(
      this.x - this.boundingBoxWidth / 2,
      this.y - this.boundingBoxHeight / 2,
      this.boundingBoxWidth,
      this.boundingBoxHeight,
    )

    drawing.setFillColor('#00f')
    drawing.setTextAlign('center')
    drawing.setTextBaseline('middle')
    drawing.setFontSize(30)
    drawing.setFontFamily('monospace')
    drawing.text(this.key, this.x, this.y)
  }

  destroy() {
    super.destroy()
    randomChoice([sndPop, sndPop2]).playMany()
    gameRooms.currentRoom.instanceCreate(KeyDestroyParticles, this.x, this.y)
  }
}

class Room extends GameRoom {
  constructor() {
    super(800, 600)

    this.backgroundColor = '#123'
    this.misses = 0
    this.maxMisses = 5

    this.createKey = this.createKey.bind(this)

    this.createKey()
  }

  createKey() {
    const numbers = '0123456789'
    const lowerCase = 'abcdefghijklmnopqrstuvwxyz'
    const upperCase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const homeRow = 'ASDFGHJKL'
    const leftHand = 'ASDF'
    const rightHand = 'JKL;'
    const bothHands = leftHand + rightHand

    const uniqueUpperCaseLetters = leftHand.split('').filter((letter) => {
      // TODO: can't use gameRooms here because objects property is not set yet???
      //       had to use GameObject.instances instead
      return GameObject.instances.every((obj) => obj.key !== letter)
    })

    const key = randomChoice(uniqueUpperCaseLetters)

    if (key && this.instanceCount(Key) < 5) {
      const instance = this.instanceCreate(Key)
      instance.key = key
    }

    setTimeout(this.createKey, 1000)
  }

  draw(drawing) {
    super.draw(drawing)

    // draw misses
    drawing.setTextAlign('left')
    drawing.setTextBaseline('top')
    drawing.setFontSize(30)
    drawing.setFontFamily('monospace')
    drawing.setFillColor('#888')
    drawing.text(` _ `.repeat(this.maxMisses), 10, 10)
    drawing.setFillColor('#F22')
    drawing.text(` X `.repeat(this.misses), 10, 10)

    if (this.misses >= this.maxMisses) {
      window.location.reload()
    }

    // STEP - BEGIN
    // TODO: this should be in step() but it doesn't exist on GameRoom yet, create it
    const keyDown = Object.keys(gameKeyboard.down).pop()
    if (!keyDown) return

    let keyMatch
    keyMatch = this.objects.find((object) => {
      return object.key === keyDown
    })

    if (keyMatch) {
      gameRooms.currentRoom.instanceDestroy(keyMatch)
    } else {
      this.misses += 1
      sndMiss.playOne()
    }
    // STEP - END
  }
}

gameRooms.addRoom(new Room())

const game = new Game()
game.start()

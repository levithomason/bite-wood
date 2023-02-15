import {
  Game,
  gameKeyboard,
  GameObject,
  GameRoom,
  gameRooms,
} from '../../core/index.js'
import { random, randomChoice } from '../../core/math.js'
import { gameCamera } from '../../core/game-camera-controller.js'

class Character extends GameObject {
  constructor() {
    super({
      boundingBoxTop: -40,
      boundingBoxLeft: -25,
      boundingBoxWidth: 50,
      boundingBoxHeight: 80,
      acceleration: 1.5,
      maxSpeed: 8,
      friction: 0.15,
    })
  }

  step() {
    super.step()

    if (gameKeyboard.active.ARROWUP) {
      this.vspeed -= this.acceleration
    }
    if (gameKeyboard.active.ARROWDOWN) {
      this.vspeed += this.acceleration
    }
    if (gameKeyboard.active.ARROWLEFT) {
      this.hspeed -= this.acceleration
    }
    if (gameKeyboard.active.ARROWRIGHT) {
      this.hspeed += this.acceleration
    }

    // max speed
    this.hspeed = Math.max(-this.maxSpeed, Math.min(this.maxSpeed, this.hspeed))
    this.vspeed = Math.max(-this.maxSpeed, Math.min(this.maxSpeed, this.vspeed))

    // friction
    this.hspeed *= 1 - this.friction
    this.vspeed *= 1 - this.friction
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
  }
}

class Sun extends GameObject {
  constructor() {
    super({
      boundingBoxTop: -50,
      boundingBoxLeft: -50,
      boundingBoxWidth: 100,
      boundingBoxHeight: 100,
      size: 200,
    })

    this.flareGapMin = 40
    this.flareGapMax = 80
    this.flareGap = 60
    this.flareGapDirection = 1
    this.flareGapSpeed = 0.05
  }

  draw(drawing) {
    super.draw(drawing)

    // sun flares
    if (this.flareGap >= this.flareGapMax) {
      this.flareGapDirection = -1
    } else if (this.flareGap <= this.flareGapMin) {
      this.flareGapDirection = 1
    }
    this.flareGap += this.flareGapDirection * this.flareGapSpeed

    const numFlares = 12
    const alphaInit = 0.5
    let alpha = alphaInit

    drawing.setLineWidth(1)
    drawing.setFillColor('transparent')
    for (let i = 0; i < numFlares; i++) {
      drawing.setStrokeColor(`rgba(255, 219, 96, ${alpha})`)
      drawing.circle(this.x, this.y, this.size / 2 + i * this.flareGap)
      alpha -= alphaInit / numFlares
    }

    // draw the sun
    drawing.setStrokeColor('transparent')
    drawing.setFillColor('#ffb700')
    drawing.circle(this.x, this.y, 100)
  }
}

class Cloud extends GameObject {
  constructor() {
    super({
      boundingBoxTop: -50,
      boundingBoxLeft: -80,
      boundingBoxWidth: 145,
      boundingBoxHeight: 80,
    })

    this.speed = random(0.1, 0.2)
    this.direction = 0
  }

  draw(drawing) {
    super.draw(drawing)

    // bottom
    drawing.setFillColor('#fff')
    drawing.setStrokeColor('transparent')
    drawing.ellipse(this.x - 40, this.y, 70, 40)

    drawing.ellipse(this.x + 30, this.y, 60, 40)

    // tops
    drawing.setStrokeColor('transparent')
    // shadow
    drawing.setFillColor('rgba(0, 0, 0, 0.05)')
    drawing.circle(this.x - 40, this.y - 25, 40)
    drawing.setFillColor('#fff')
    drawing.circle(this.x - 30, this.y - 40, 50)

    // shadow
    drawing.setFillColor('rgba(0, 0, 0, 0.05)')
    drawing.circle(this.x + 30, this.y - 35, 40)
    drawing.setFillColor('#fff')
    drawing.circle(this.x + 30, this.y - 30, 40)
  }
}

class DirtWithGrass extends GameObject {
  constructor() {
    super({
      boundingBoxTop: 0,
      boundingBoxLeft: 0,
      boundingBoxWidth: 100,
      boundingBoxHeight: 50,
    })

    // create an array of random rock sizes and positions within the dirt
    this.rocks = []
    const numRocks = random(0, 2)
    for (let i = 0; i < numRocks; i += 1) {
      const size = random(4, 18)
      const padding = size // prevent rocks from overflowing the dirt

      const x = random(padding, this.boundingBoxWidth - padding)
      const y = random(padding, this.boundingBoxHeight - padding)

      const shape = randomChoice(['circle', 'square'])
      const color = randomChoice(['#9a4d28', '#79430b'])

      this.rocks.push({ x, y, size, shape, color })
    }
  }

  draw(drawing) {
    super.draw(drawing)

    drawing.setLineWidth(3)
    drawing.setStrokeColor('transparent')

    // dirt
    drawing.setFillColor('#8b4513')
    drawing.rectangle(
      this.x,
      this.y,
      this.boundingBoxWidth,
      this.boundingBoxHeight,
    )

    // rocks in the dirt
    this.rocks.forEach((rock) => {
      drawing.setFillColor(rock.color)

      switch (rock.shape) {
        case 'circle':
          drawing.circle(this.x + rock.x, this.y + rock.y, rock.size)
          break
        case 'square':
          drawing.rectangle(
            this.x + rock.x - rock.size / 2,
            this.y + rock.y - rock.size / 2,
            rock.size,
            rock.size,
          )
          break
      }
    })

    // dirt shadow
    drawing.setFillColor('rgba(0, 0, 0, 0.05)')
    drawing.rectangle(
      this.x,
      this.y + this.boundingBoxHeight / 3,
      this.boundingBoxWidth,
      this.boundingBoxHeight / 3,
    )

    // grass
    // draw the grass in 3 layers to create a gradient effect
    drawing.setFillColor('#066e06')
    drawing.rectangle(
      this.x,
      this.y,
      this.boundingBoxWidth,
      this.boundingBoxHeight / 3,
    )
    drawing.setFillColor('#0a8c0a')
    drawing.rectangle(
      this.x,
      this.y,
      this.boundingBoxWidth,
      this.boundingBoxHeight / 5,
    )
    drawing.setFillColor('#0da40d')
    drawing.rectangle(
      this.x,
      this.y,
      this.boundingBoxWidth,
      this.boundingBoxHeight / 10,
    )
  }
}

// create a small white and yellow daisies
class Flower extends GameObject {
  constructor() {
    super(
      (() => {
        const height = random(25, 40)
        return {
          boundingBoxTop: -height,
          boundingBoxLeft: -2,
          boundingBoxWidth: 4,
          boundingBoxHeight: height,
        }
      })(),
    )

    this.stemHeight = -this.boundingBoxTop
    this.petalSize = this.stemHeight / 10
    this.stemWidth = this.petalSize / 2

    this.leafLSizeX = random(this.petalSize, this.petalSize * 1.5)
    this.leafLSizeY = random(this.leafLSizeX / 2, this.leafLSizeX / 3)
    this.leafLXOffset = this.leafLSizeX
    this.leafLYOffset = random(this.stemHeight * 0.35, this.stemHeight * 0.6)
    this.leafLRotation = random(45 - 5, 45 + 5)

    this.leafRSizeX = random(this.petalSize, this.petalSize * 1.5)
    this.leafRSizeY = random(this.leafRSizeX / 2, this.leafRSizeX / 3)
    this.leafRXOffset = this.leafRSizeX
    this.leafRYOffset = random(this.stemHeight * 0.35, this.stemHeight * 0.6)
    this.leafRRotation = random(-45 + 5, -45 - 5)
  }

  draw(drawing) {
    super.draw(drawing)

    // stem
    drawing.setLineWidth(this.stemWidth)
    drawing.setStrokeColor('#008000')
    drawing.line(this.x, this.y, this.x, this.y - this.stemHeight)

    // one small leaf on each side of the stem
    drawing.setLineWidth(2)
    drawing.setFillColor('#008000')
    drawing.setStrokeColor('transparent')
    drawing.ellipse(
      this.x - this.leafLXOffset,
      this.y - this.leafLYOffset,
      this.leafLSizeX,
      this.leafLSizeY,
      this.leafLRotation,
    )
    drawing.ellipse(
      this.x + this.leafRXOffset,
      this.y - this.leafRYOffset,
      this.leafRSizeX,
      this.leafRSizeY,
      this.leafRRotation,
    )

    // flower petals
    drawing.setStrokeColor('transparent')
    drawing.setFillColor('#fff')
    drawing.circle(
      this.x - this.petalSize,
      this.y - this.stemHeight - this.petalSize,
      this.petalSize,
    )
    drawing.circle(
      this.x + this.petalSize,
      this.y - this.stemHeight - this.petalSize,
      this.petalSize,
    )
    drawing.circle(
      this.x - this.petalSize,
      this.y - this.stemHeight + this.petalSize,
      this.petalSize,
    )
    drawing.circle(
      this.x + this.petalSize,
      this.y - this.stemHeight + this.petalSize,
      this.petalSize,
    )

    // center of the flower
    drawing.setStrokeColor('#da0')
    drawing.setFillColor('#fc0')
    drawing.circle(this.x, this.y - this.stemHeight, this.petalSize * 0.8)
  }
}

class Room extends GameRoom {
  constructor() {
    super(3000, 600)

    // add sun
    this.instanceCreate(Sun, 1100, 100)

    // add clouds
    const numClouds = random(5, 10)
    const cloudGap = this.width / numClouds

    for (let i = 0; i < numClouds; i += 1) {
      const x = i * cloudGap + cloudGap / 2
      const y = random(100, 250)
      this.instanceCreate(Cloud, x, y)
    }

    // add dirt
    for (let i = 0; i < this.width / 100; i += 1) {
      const x = i * 100
      const y = this.height - 50
      this.instanceCreate(DirtWithGrass, x, y)
    }

    // add flowers
    const numFlowers = random(10, 20)
    const flowerGap = this.width / numFlowers
    for (let i = 0; i < numFlowers; i += 1) {
      const randomOffset = random(-flowerGap * 0.8, flowerGap * 0.8)
      const x = i * flowerGap + flowerGap / 2 + randomOffset
      const y = this.height - 50
      this.instanceCreate(Flower, x, y)
    }

    // create the character
    this.character = this.instanceCreate(Character, 1400, 500)
    gameCamera.target = this.character
  }

  draw(drawing) {
    super.draw(drawing)

    // draw a gradient sky
    const skyGradient = drawing.createLinearGradient(0, 0, 0, this.height)
    skyGradient.addColorStop(0, '#79bafc')
    skyGradient.addColorStop(1, '#a9edff')
    drawing.setFillColor(skyGradient)
    drawing.setStrokeColor('transparent')
    drawing.rectangle(0, 0, this.width, this.height)

    // TODO: add GameRoom a step method
  }
}

const room = new Room(800, 600)
gameRooms.addRoom(room)

const game = new Game()
// gameState.debug = true
game.start()

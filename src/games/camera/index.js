import {
  Game,
  gameKeyboard,
  GameObject,
  gamePhysics,
  GameRoom,
  gameRooms,
} from '../../core/index.js'
import { direction, random, randomChoice } from '../../core/math.js'
import { gameCamera } from '../../core/game-camera-controller.js'

class Character extends GameObject {
  static height = 80
  static width = 50

  constructor() {
    super({
      boundingBoxTop: -Character.height,
      boundingBoxLeft: -Character.width / 2,
      boundingBoxWidth: Character.width,
      boundingBoxHeight: Character.height,
      acceleration: 2,
      maxSpeed: 12,
      friction: 0.15,
    })
  }

  step() {
    super.step()

    if (gameKeyboard.active.W) {
      this.vspeed -= this.acceleration
    }
    if (gameKeyboard.active.S) {
      this.vspeed += this.acceleration
    }
    if (gameKeyboard.active.A) {
      this.hspeed -= this.acceleration
    }
    if (gameKeyboard.active.D) {
      this.hspeed += this.acceleration
    }

    // max speed
    this.speed = Math.max(-this.maxSpeed, Math.min(this.maxSpeed, this.speed))

    // friction
    this.hspeed *= 1 - this.friction
    this.vspeed *= 1 - this.friction

    this.keepInRoom(0, { bottom: 50 })
  }

  draw(drawing) {
    super.draw(drawing)

    drawing.setLineWidth(2)
    drawing.setStrokeColor('#000')
    drawing.setFillColor('#f8f')
    drawing.rectangle(
      this.x - this.insertionX,
      this.y - this.insertionY,
      this.boundingBoxWidth,
      this.boundingBoxHeight,
    )
  }
}

class UFO extends GameObject {
  constructor() {
    super({
      boundingBoxTop: -50,
      boundingBoxLeft: -50,
      boundingBoxWidth: 100,
      boundingBoxHeight: 100,
    })

    this.accelerationChase = 0.2
    this.accelerationRest = 0.1
    this.maxSpeedChase = 6
    this.maxSpeedRest = 3

    this.direction = gamePhysics.DIRECTION_RIGHT
  }

  step() {
    super.step()

    const player = gameRooms.currentRoom.objects.find((o) => {
      return o instanceof Character
    })

    // follow the player if the player is in space
    if (player.y < gameRooms.currentRoom.yPosition.airStart) {
      this.motionAdd(
        direction(this.x, this.y, player.x, player.y - Character.height),
        this.accelerationChase,
      )
      this.speed = Math.min(this.maxSpeedChase, this.speed)
    }
    // otherwise, go back to the top left corner
    else {
      // TODO: why is there no currentRoom when this is called in the constructor?
      // We would normally instantiate this property in the constructor, but
      // the room is not yet defined when the constructor is called.
      const restPoint = { x: gameRooms.currentRoom.width / 2, y: 100 }
      this.motionAdd(
        direction(this.x, this.y, restPoint.x, restPoint.y),
        this.accelerationRest,
      )
      this.speed = Math.min(this.maxSpeedRest, this.speed)
    }

    this.keepInRoom()
  }

  draw(drawing) {
    super.draw(drawing)

    drawing.setLineWidth(0)
    drawing.setStrokeColor('transparent')

    // glass
    drawing.setFillColor('#99ffff88')
    drawing.circle(this.x, this.y, 30)

    // shine on glass
    drawing.setFillColor('#ccffffaa')
    drawing.ellipse(this.x - 7, this.y - 18, 15, 8, -20)

    // body
    drawing.setFillColor('#aaa')
    drawing.ellipse(this.x, this.y + 18, 60, 20)
    drawing.setFillColor('#777')
    drawing.ellipse(this.x, this.y + 20, 60, 18)

    drawing.setFillColor('#555')
    drawing.ellipse(this.x, this.y + 25, 45, 15)

    // rivets
    drawing.setFillColor('#333')
    drawing.ellipse(this.x - 52, this.y + 18, 4, 3, -60)
    drawing.ellipse(this.x + 20, this.y + 8, 5, 3, 8)
    drawing.ellipse(this.x - 20, this.y + 8, 5, 3, -8)
    drawing.ellipse(this.x + 52, this.y + 18, 4, 3, 60)

    // antenna
    drawing.setLineWidth(3)
    drawing.setStrokeColor('#888')
    drawing.line(this.x, this.y - 30, this.x, this.y - 50)

    drawing.setStrokeColor('transparent')
    drawing.setFillColor('#c54')
    drawing.circle(this.x, this.y - 50, 5)
  }
}

class Sun extends GameObject {
  static radius = 200
  constructor() {
    super({
      radius: Sun.radius,
      boundingBoxTop: -Sun.radius,
      boundingBoxLeft: -Sun.radius,
      boundingBoxWidth: Sun.radius * 2,
      boundingBoxHeight: Sun.radius * 2,
    })
  }

  draw(drawing) {
    super.draw(drawing)

    // draw the sun
    drawing.setStrokeColor('transparent')
    drawing.setFillColor('#ffb700')
    drawing.circle(this.x, this.y, Sun.radius)
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

    this.speed = random(0.1, 0.5)
    this.direction = randomChoice([0, 180])
  }

  step() {
    super.step()
    this.keepInRoom()
  }

  draw(drawing) {
    super.draw(drawing)

    drawing.setStrokeColor('transparent')

    // bottom poofs
    drawing.setFillColor('#fff')
    drawing.ellipse(this.x - 40, this.y, 70, 40)
    drawing.ellipse(this.x + 30, this.y, 60, 40)

    // top left - shadow then poof
    drawing.setFillColor('rgba(0, 0, 0, 0.05)')
    drawing.circle(this.x - 40, this.y - 25, 40)
    drawing.setFillColor('#fff')
    drawing.circle(this.x - 30, this.y - 40, 50)

    // top right - shadow then poof
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

// create a tree class which draws 3 layers of leaves on random branches
class Tree extends GameObject {
  constructor() {
    super(
      (() => {
        const trunkWidth = random(20, 40)
        const trunkHeight = random(trunkWidth * 4, trunkWidth * 6)

        return {
          trunkWidth,
          trunkHeight,
          boundingBoxTop: -trunkHeight,
          boundingBoxLeft: -trunkWidth / 2,
          boundingBoxWidth: trunkWidth,
          boundingBoxHeight: trunkHeight,
        }
      })(),
    )

    const xRadius = random(this.trunkWidth * 2, this.trunkWidth * 4)
    const yRadius = random(xRadius * 1.1, xRadius * 1.6)
    this.leaves = {
      xOffset: random(-this.trunkWidth, this.trunkWidth) * 0.25,
      yOffset: yRadius + this.trunkHeight - 10,
      xRadius,
      yRadius,
      rotation: random(-10, 10),
      lightColor: '#0fba0f',
      darkColor: '#0e800e',
    }
  }

  draw(drawing) {
    super.draw(drawing)

    // trunk
    drawing.setStrokeColor('transparent')
    const trunkGradient = drawing.createLinearGradient(
      this.x,
      this.y,
      this.x,
      this.y - this.trunkHeight,
    )
    trunkGradient.addColorStop(1, '#603415')
    trunkGradient.addColorStop(0.7, '#91592b')
    drawing.setFillColor(trunkGradient)
    drawing.rectangle(
      this.x - this.trunkWidth / 2,
      this.y - this.trunkHeight,
      this.trunkWidth,
      this.trunkHeight,
    )
    const trunkVerticalGradient = drawing.createLinearGradient(
      this.x - this.trunkWidth / 2,
      this.y,
      this.x + this.trunkWidth / 2,
      this.y,
    )
    trunkVerticalGradient.addColorStop(0, 'rgba(63,28,4,0.2)')
    trunkVerticalGradient.addColorStop(0.3, '#91592b00')
    trunkVerticalGradient.addColorStop(0.4, '#91592b00')
    trunkVerticalGradient.addColorStop(0.8, 'rgba(63,28,4,0.2)')
    drawing.setFillColor(trunkVerticalGradient)
    drawing.rectangle(
      this.x - this.trunkWidth / 2,
      this.y - this.trunkHeight,
      this.trunkWidth,
      this.trunkHeight,
    )

    // leaves
    drawing.setStrokeColor('transparent')

    const leafGradient = drawing.createLinearGradient(
      this.x + this.leaves.xOffset,
      this.y - this.leaves.yOffset - this.leaves.yRadius * 0.5,
      this.x + this.leaves.xOffset,
      this.y - this.leaves.yOffset + this.leaves.yRadius * 0.5,
    )
    leafGradient.addColorStop(0, this.leaves.lightColor)
    leafGradient.addColorStop(1, this.leaves.darkColor)
    drawing.setFillColor(leafGradient)

    drawing.ellipse(
      this.x + this.leaves.xOffset,
      this.y - this.leaves.yOffset,
      this.leaves.xRadius,
      this.leaves.yRadius,
      this.leaves.rotation,
    )
  }
}

class Room extends GameRoom {
  constructor() {
    super({ width: 4000, height: 4000 })
    this.layers = {
      starsStart: 0.5,
      spaceStart: 0.5,
      airStart: 0.7,
      cloudStart: 0.75,
      cloudEnd: 0.85,
    }

    this.yPosition = {
      starsStart: this.layers.starsStart * this.height,
      spaceStart: this.layers.spaceStart * this.height,
      airStart: this.layers.airStart * this.height,
      cloudStart: this.layers.cloudStart * this.height,
      cloudEnd: this.layers.cloudEnd * this.height,
    }

    // add stars
    const numStars = this.width / 10
    this.stars = []
    for (let i = 0; i < numStars; i += 1) {
      const x = random(this.width)
      const y = random(this.yPosition.starsStart)
      const hue = random(0, 360)
      const alpha = 1 - random(0.2, 0.8 * (y / this.yPosition.starsStart))
      const size = random(1, 2)
      this.stars.push({ x, y, size, hue, alpha })
    }

    // add sun
    this.instanceCreate(Sun, this.width / 2, this.yPosition.spaceStart / 2)

    // add clouds
    const numClouds = this.width / 400

    for (let i = 0; i < numClouds; i += 1) {
      const x = random(100, this.width - 100)
      const y = random(this.yPosition.cloudStart, this.yPosition.cloudEnd)
      this.instanceCreate(Cloud, x, y)
    }

    // add trees
    const treeGap = random(400, 600)
    const numTrees = this.width / treeGap
    for (let i = 0; i < numTrees; i += 1) {
      const randomOffset = random(-treeGap * 0.5, treeGap * 0.5)
      const x = i * treeGap + treeGap / 2 + randomOffset
      const y = this.height - 50
      this.instanceCreate(Tree, x, y)
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

    // ufo
    this.instanceCreate(UFO, 100, 100)

    // create the character
    this.character = this.instanceCreate(
      Character,
      this.width / 2,
      this.height - 50,
    )
    gameCamera.target = this.character
  }

  draw(drawing) {
    super.draw(drawing)

    // draw a gradient sky
    const skyGradient = drawing.createLinearGradient(0, 0, 0, this.height)
    skyGradient.addColorStop(0, '#000')
    skyGradient.addColorStop(this.layers.spaceStart, '#008')
    skyGradient.addColorStop(this.layers.airStart, '#79bafc')
    skyGradient.addColorStop(1, '#a9edff')
    drawing.setFillColor(skyGradient)
    drawing.setStrokeColor('transparent')
    drawing.rectangle(0, 0, this.width, this.height)

    // draw stars
    drawing.setStrokeColor('transparent')
    for (let i = 0; i < this.stars.length; i += 1) {
      const star = this.stars[i]
      drawing.setFillColor(`hsla(${star.hue}, 100%, 95%, ${star.alpha}`)
      drawing.circle(star.x, star.y, star.size)
    }
  }
}

const room = new Room()
gameRooms.addRoom(room)

const game = new Game()
// gameState.debug = true
game.start()

import { Game } from '../../core/game.js'
import { gameMouse, GameObject, GameRoom, gameRooms } from '../../core/index.js'
import { direction, distance, Vector } from '../../core/math.js'
import {
  collisionPointObject,
  collisionPointRectangle,
} from '../../core/collision.js'

const OBSTACLE_SIZE = 80
class Obstacle extends GameObject {
  constructor() {
    super({
      boundingBoxTop: -(OBSTACLE_SIZE / 2),
      boundingBoxLeft: -(OBSTACLE_SIZE / 2),
      boundingBoxWidth: OBSTACLE_SIZE,
      boundingBoxHeight: OBSTACLE_SIZE,
    })
  }

  draw(drawing) {
    super.draw(drawing)

    drawing.setStrokeColor('rgba(0, 128, 255, 0.5)')
    drawing.setLineWidth(2)
    const overhang = 50
    drawing.line(
      this.boundingBoxLeft,
      this.boundingBoxTop - overhang,
      this.boundingBoxLeft,
      this.boundingBoxBottom + overhang,
    )
    drawing.line(
      this.boundingBoxLeft - overhang,
      this.boundingBoxTop,
      this.boundingBoxRight + overhang,
      this.boundingBoxTop,
    )
    drawing.line(
      this.boundingBoxRight,
      this.boundingBoxTop - overhang,
      this.boundingBoxRight,
      this.boundingBoxBottom + overhang,
    )
    drawing.line(
      this.boundingBoxLeft - overhang,
      this.boundingBoxBottom,
      this.boundingBoxRight + overhang,
      this.boundingBoxBottom,
    )

    drawing.setStrokeColor('#fff')
    drawing.setFillColor('transparent')
    drawing.setLineWidth(2)
    drawing.rectangle(
      this.boundingBoxLeft,
      this.boundingBoxTop,
      OBSTACLE_SIZE,
      OBSTACLE_SIZE,
    )
  }
}

class MouseLine extends GameObject {
  constructor() {
    super({
      events: {
        mouseDown: {
          left: () => {
            this.x = gameMouse.x
            this.y = gameMouse.y
          },
        },
      },
    })
  }
  create() {
    this.x = 200
    this.y = 150
    this.vector = new Vector(gameMouse.x - this.x, gameMouse.y - this.y)

    gameMouse.x = 546
    gameMouse.y = 317
  }

  get x2() {
    return this.x + this.vector.x
  }
  get y2() {
    return this.y + this.vector.y
  }
  set x2(val) {
    this.vector.x = val - this.x
  }
  set y2(val) {
    this.vector.y = val - this.y
  }
  get width() {
    return this.x2 - this.x
  }
  get height() {
    return this.y2 - this.y
  }

  step() {
    super.step()
    this.x2 = gameMouse.x
    this.y2 = gameMouse.y
  }

  draw(drawing) {
    super.draw(drawing)
    drawing.setTextAlign('center')
    drawing.setTextBaseline('middle')

    const drawIntersects = (object, top, bottom, left, right) => {
      const drawPoint = (point, label, onColor, offColor) => {
        const tolerance = 50
        const isNearObject =
          point.x >= object.boundingBoxLeft - tolerance &&
          point.x <= object.boundingBoxRight + tolerance &&
          point.y >= object.boundingBoxTop - tolerance &&
          point.y <= object.boundingBoxBottom + tolerance

        if (!isNearObject) return

        const isOnLeft = point.x >= object.boundingBoxLeft
        const isOnRight = point.x <= object.boundingBoxRight
        const isOnTop = point.y >= object.boundingBoxTop
        const isOnBottom = point.y <= object.boundingBoxBottom
        const isOnObject = isOnLeft && isOnRight && isOnTop && isOnBottom

        drawing.setStrokeColor('transparent')
        drawing.setFillColor(isOnObject ? onColor : offColor)
        drawing.circle(point.x, point.y, 10)

        drawing.setFontSize(12)
        drawing.setFillColor(isOnObject ? '#000' : '#fff')
        drawing.text(label, point.x, point.y)
      }

      drawPoint(top, 'T', '#0f0', '#060')
      drawPoint(bottom, 'B', '#0f0', '#060')
      drawPoint(left, 'L', '#f0f', '#707')
      drawPoint(right, 'R', '#f0f', '#707')
    }

    // draw default line under all
    drawing.setLineWidth(2)
    drawing.setStrokeColor('#fff')
    drawing.setFillColor('#fff')
    drawing.arrow(this.x, this.y, this.x2, this.y2)

    const collision = room.objects.reduce((acc, object) => {
      // don't collide with self
      if (object === this) return acc

      const topRatio = (object.boundingBoxTop - this.y) / this.height
      const leftRatio = (object.boundingBoxLeft - this.x) / this.width
      const rightRatio = (object.boundingBoxRight - this.x) / this.width
      const bottomRatio = (object.boundingBoxBottom - this.y) / this.height

      const top = {
        x: this.width * topRatio + this.x,
        y: object.boundingBoxTop,
        ratio: topRatio,
      }

      const left = {
        x: object.boundingBoxLeft,
        y: this.height * leftRatio + this.y,
        ratio: leftRatio,
      }

      const right = {
        x: object.boundingBoxRight,
        y: this.height * rightRatio + this.y,
        ratio: rightRatio,
      }

      const bottom = {
        x: this.width * bottomRatio + this.x,
        y: object.boundingBoxBottom,
        ratio: bottomRatio,
      }

      drawIntersects(object, top, bottom, left, right)

      const pointsOnBox = [top, left, right, bottom].filter(
        (point) =>
          point.x >= object.boundingBoxLeft &&
          point.x <= object.boundingBoxRight &&
          point.y >= object.boundingBoxTop &&
          point.y <= object.boundingBoxBottom,
      )

      const isPointInRectangle = pointsOnBox.some((point) => {
        return collisionPointRectangle(
          point.x,
          point.y,
          this.x,
          this.y,
          this.x2,
          this.y2,
        )
      })

      const isOriginInRectangle = collisionPointRectangle(
        this.x,
        this.y,
        object.boundingBoxLeft,
        object.boundingBoxTop,
        object.boundingBoxRight,
        object.boundingBoxBottom,
      )

      const nearestPoint = isOriginInRectangle
        ? { x: this.x, y: this.y }
        : pointsOnBox.length
        ? pointsOnBox.reduce((a, b) => {
            if (!b) return a

            const distA = distance(this.x, this.y, a.x, a.y)
            const distB = distance(this.x, this.y, b.x, b.y)

            return distA < distB ? a : b
          })
        : null

      const isColliding = pointsOnBox.length >= 2 && isPointInRectangle

      if (nearestPoint && nearestPoint.ratio > 0) {
        // show potential nearest point
        drawing.setLineWidth(2)
        drawing.setStrokeColor('#ff0')
        drawing.setFillColor('transparent')
        drawing.circle(nearestPoint.x, nearestPoint.y, 10)
      }

      if (isColliding) {
        const distanceToNearestPoint = distance(
          this.x,
          this.y,
          nearestPoint.x,
          nearestPoint.y,
        )

        if (!acc || distanceToNearestPoint < acc.distance) {
          return {
            object,
            points: pointsOnBox,
            pointOfCollision: nearestPoint,
            distance: distanceToNearestPoint,
            top,
            left,
            right,
            bottom,
          }
        }

        return acc
      }

      return acc
    }, null)

    // Draw rectangle formed by vector
    drawing.setLineWidth(1)
    drawing.setFillColor('transparent')
    drawing.setStrokeColor('rgba(255, 255, 255, 0.25)')
    drawing.rectangle(this.x, this.y, this.width, this.height)

    // Draw line
    if (collision) {
      drawing.setLineWidth(2)
      drawing.setStrokeColor('#f00')
      drawing.setFillColor('#f00')
      drawing.arrow(this.x, this.y, this.x2, this.y2)

      // Draw collision objects
      const { object, points, pointOfCollision, top, left, right, bottom } =
        collision
      drawing.setFillColor('transparent')

      drawing.setLineWidth(2)
      drawing.setStrokeColor('#f00')
      drawing.rectangle(
        object.boundingBoxLeft,
        object.boundingBoxTop,
        object.boundingBoxWidth,
        object.boundingBoxHeight,
      )

      // // highlight intersects on box
      // drawing.setLineWidth(3)
      // drawing.setFillColor('transparent')
      // drawing.setStrokeColor('#f00')
      // points.forEach((point) => {
      //   if (point === pointOfCollision) return
      //   drawing.circle(point.x, point.y, 10)
      // })

      drawIntersects(object, top, bottom, left, right)

      if (pointOfCollision) {
        // highlight point of collision
        drawing.setLineWidth(3)
        drawing.setFillColor('transparent')
        drawing.setStrokeColor('#ff0')
        drawing.circle(pointOfCollision.x, pointOfCollision.y, 10)
      }
    }

    // Draw magnitude and direction
    drawing.setFontSize(12)
    drawing.setFillColor('#fff')
    drawing.text(this.vector.magnitude.toFixed(0), this.x, this.y - 26)
    drawing.text(this.vector.direction.toFixed(0) + '*', this.x, this.y - 10)
  }

  drawCollision(collision) {}
}

class Room extends GameRoom {
  constructor() {
    super(800, 600)
    this.backgroundColor = '#012'
  }
}

const room = new Room()
const offset = room.height / 3
room.instanceCreate(Obstacle, offset * 1, offset)
room.instanceCreate(Obstacle, offset * 2, offset * 0.5)
room.instanceCreate(Obstacle, offset * 3, offset)
room.instanceCreate(Obstacle, offset * 1, offset * 2)
room.instanceCreate(Obstacle, offset * 2, offset * 2.5)
room.instanceCreate(Obstacle, offset * 3, offset * 2)

// room.instanceCreate(Obstacle, room.width / 2, room.height / 2)

room.instanceCreate(MouseLine, 200, 200)

gameRooms.addRoom(room)

// gameState.debug = true

const game = new Game()
game.start()

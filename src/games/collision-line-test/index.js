import {
  Game,
  gameMouse,
  GameObject,
  GameRoom,
  gameRooms,
} from '../../core/index.js'
import { distance, Vector } from '../../core/math.js'
import { collisionPointRectangle } from '../../core/collision.js'

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

    drawing.setLineWidth(2)
    drawing.setStrokeColor('rgba(0, 128, 255, 0.2)')
    const overhang = 0
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

      if (topRatio < 0 && leftRatio < 0 && rightRatio < 0 && bottomRatio < 0) {
        return acc
      }

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

      const points = [top, left, right, bottom]
      const pointsInFront = []
      const pointsOnBox = []

      points.forEach((point) => {
        const isInFront = point.ratio >= 0
        if (!isInFront) return
        pointsInFront.push(point)

        const isOnBox =
          point.x >= object.boundingBoxLeft &&
          point.x <= object.boundingBoxRight &&
          point.y >= object.boundingBoxTop &&
          point.y <= object.boundingBoxBottom

        if (isOnBox) pointsOnBox.push(point)
      })

      this.drawIntersects(drawing, object, pointsInFront)

      const isSomePointInRectangle = pointsOnBox.some((point) => {
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
        ? { x: this.x, y: this.y, ratio: 0 }
        : pointsOnBox.length
        ? pointsOnBox.reduce((a, b) => {
            if (!b) return a

            const distA = distance(this.x, this.y, a.x, a.y)
            const distB = distance(this.x, this.y, b.x, b.y)

            return distA < distB ? a : b
          })
        : null

      const isColliding =
        isOriginInRectangle ||
        (pointsOnBox.length >= 1 && isSomePointInRectangle)

      if (nearestPoint && nearestPoint.ratio > 0) {
        // show where nearest point would collide if the line were extended
        drawing.setLineWidth(2)
        drawing.setStrokeColor('#fff')
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
            points: pointsInFront,
            pointOfCollision: nearestPoint,
            distance: distanceToNearestPoint,
          }
        }

        return acc
      }

      return acc
    }, null)

    if (collision) {
      // Draw red line when colliding
      drawing.setLineWidth(2)
      drawing.setStrokeColor('#f00')
      drawing.setFillColor('#f00')
      drawing.arrow(this.x, this.y, this.x2, this.y2)

      // Draw collision objects
      const { object, pointOfCollision, points } = collision
      drawing.setFillColor('transparent')

      // Highlight
      drawing.setLineWidth(2)
      drawing.setStrokeColor('#f00')
      drawing.rectangle(
        object.boundingBoxLeft,
        object.boundingBoxTop,
        object.boundingBoxWidth,
        object.boundingBoxHeight,
      )

      this.drawIntersects(drawing, object, points)

      // highlight point of collision
      if (pointOfCollision) {
        drawing.setLineWidth(3)
        drawing.setFillColor('transparent')
        drawing.setStrokeColor('#f00')
        drawing.circle(pointOfCollision.x, pointOfCollision.y, 10)
        this.drawIntersects(drawing, object, [pointOfCollision])
      }
    }

    // Draw magnitude and direction
    drawing.setFontSize(12)
    drawing.setFillColor('#fff')
    drawing.text(this.vector.magnitude.toFixed(0), this.x, this.y - 26)
    drawing.text(this.vector.direction.toFixed(0) + '*', this.x, this.y - 10)
  }

  drawIntersects(drawing, object, points) {
    const overhang = 50
    const verticalColors = { on: '#0f0', off: '#090', bg: '#020' }
    const horizontalColors = { on: '#ff0', off: '#990', bg: '#220' }

    const isNearObject = (point) =>
      point.x >= object.boundingBoxLeft - overhang &&
      point.x <= object.boundingBoxRight + overhang &&
      point.y >= object.boundingBoxTop - overhang &&
      point.y <= object.boundingBoxBottom + overhang

    const drawPoint = (point) => {
      if (!isNearObject(point)) return

      const isPastLeft = point.x >= object.boundingBoxLeft
      const isBeforeRight = point.x <= object.boundingBoxRight
      const isPastTop = point.y >= object.boundingBoxTop
      const isBeforeBottom = point.y <= object.boundingBoxBottom
      const isInsideObject =
        isPastLeft && isBeforeRight && isPastTop && isBeforeBottom

      const isOnLeft = point.x === object.boundingBoxLeft
      const isOnRight = point.x === object.boundingBoxRight
      const isOnTop = point.y === object.boundingBoxTop
      const isOnBottom = point.y === object.boundingBoxBottom
      const isHorizontal = isOnLeft || isOnRight

      const label =
        (isOnLeft && 'L') ||
        (isOnRight && 'R') ||
        (isOnTop && 'T') ||
        (isOnBottom && 'B') ||
        (isInsideObject && 'IN') ||
        '?'

      const color = isHorizontal ? horizontalColors : verticalColors
      drawing.setStrokeColor('transparent')
      drawing.setFillColor(color.bg)
      drawing.circle(point.x, point.y, 8)

      drawing.setFontSize(12)
      drawing.setFillColor(isInsideObject ? color.on : color.off)
      drawing.text(label, point.x, point.y)

      drawing.setFontSize(10)
      drawing.text(point.ratio.toFixed(2), point.x, point.y - 16)
    }

    points.forEach((point) => drawPoint(point))
  }
}

class Room extends GameRoom {
  constructor() {
    super({ width: 800, height: 600 })
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

room.instanceCreate(MouseLine, room.width / 2, room.height / 2)

gameRooms.addRoom(room)

// gameState.debug = true

const game = new Game()
game.start()

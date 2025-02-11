import {
  Game,
  GameImage,
  GameObject,
  GameRoom,
  gameRooms,
  GameSprite,
  gameState,
} from '../../core/index.js'

const spriteSheet = new GameImage(
  '../run-unicorn-run/images/unicorn-cartoon.png',
)

// TODO: make an asset loader that waits for all assets to load
spriteSheet
  .load()
  .then(async () => {
    const spriteConfig = {
      frameFirstX: 22,
      frameFirstY: 24,
      frameWidth: 87,
      frameHeight: 96,
      frameCount: 4,
      insertionX: 20,
      insertionY: 96,

      boundingBoxTop: 40,
      boundingBoxLeft: 24,
      boundingBoxWidth: 36,
      boundingBoxHeight: 24,

      stepsPerFrame: 60,
    }

    const spriteR = new GameSprite(spriteSheet, spriteConfig)
    const spriteL = new GameSprite(spriteSheet, { ...spriteConfig, rtl: true })

    await Promise.all([spriteR.image.load(), spriteL.image.load()])

    return spriteL
  })
  .then((sprite) => {
    class Object extends GameObject {
      constructor() {
        super({ sprite })
      }
    }

    class Room extends GameRoom {
      constructor() {
        super(sprite.image.width, sprite.image.height)

        this.backgroundColor = 'white'
        this.backgroundImage = sprite.image
      }

      draw(drawing) {
        super.draw(drawing)

        const ctx = drawing.canvas.getContext('2d')
        ctx.translate(0.5, 0.5)
        drawing.setLineWidth(1)

        drawing.setFontSize(
          Math.max(
            12,
            Math.round(Math.min(sprite.frameWidth, sprite.frameHeight) * 0.3),
          ),
        )
        drawing.setTextAlign('center')
        drawing.setTextBaseline('top')

        const { globalCompositeOperation } = ctx

        // frames
        for (let idx = 0; idx < sprite.frameCount; idx += 1) {
          const isActive = sprite.frameIndex === idx

          // const x = sprite.frameFirstX + sprite.frameWidth * idx
          const x = sprite.getFrameXAtIndex(idx)
          const y = sprite.frameFirstY
          const w = sprite.frameWidth
          const h = sprite.frameHeight

          const frameStrokeColor = isActive
            ? 'rgba(0, 255, 0, 1)'
            : 'rgba(128, 128, 128, 1)'
          const frameFillColor = isActive
            ? 'transparent'
            : 'rgba(128, 128, 128, 0.05)'

          // frame bg
          ctx.globalCompositeOperation = 'difference'
          drawing.setStrokeColor('transparent')
          drawing.setFillColor(frameFillColor)
          drawing.rectangle(x, y, w, h)
          ctx.globalCompositeOperation = globalCompositeOperation

          // frame bounding box
          drawing.setFillColor('transparent')
          drawing.setStrokeColor('magenta')
          drawing.rectangle(
            x + sprite.boundingBoxLeft,
            y + sprite.boundingBoxTop,
            sprite.boundingBoxWidth,
            sprite.boundingBoxHeight,
          )

          // frame stroke
          drawing.setFillColor('transparent')
          drawing.setStrokeColor(frameStrokeColor)
          drawing.rectangle(x, y, w, h)

          // frame index
          drawing.setStrokeColor('rgba(0, 0, 0, 1)')
          drawing.strokeText(
            idx,
            x + sprite.frameWidth / 2,
            y + sprite.frameHeight,
          )
          drawing.setFillColor('rgba(255, 255, 255, 0.2)')
          drawing.text(idx, x + sprite.frameWidth / 2, y + sprite.frameHeight)

          // insertion point
          drawing.setStrokeColor('magenta')
          drawing.cross(x + sprite.insertionX, y + sprite.insertionY)
        }
        ctx.translate(-0.5, -0.5)

        // preview frame
        // This is drawn so the object has a solid bg to draw on top of.
        // Otherwise, the preview may land on top of another sprite sheet frame,
        // making it difficult to see the animation clearly.
        const previewStrokeWidth = 2
        drawing.setStrokeColor('#888')
        drawing.setLineWidth(previewStrokeWidth)
        drawing.setFillColor('rgba(255, 255, 255, 1)')
        drawing.rectangle(
          sprite.getFrameXAtIndex(sprite.frameCount) - previewStrokeWidth / 2,
          sprite.frameFirstY - previewStrokeWidth / 2,
          sprite.frameWidth + previewStrokeWidth,
          sprite.frameHeight + previewStrokeWidth,
        )
      }
    }

    const room = new Room()
    room.instanceCreate(
      Object,
      sprite.getFrameXAtIndex(sprite.frameCount) + sprite.insertionX,
      sprite.frameFirstY + sprite.insertionY,
    )
    gameRooms.addRoom(room)

    const game = new Game({
      width: sprite.image.width,
      height: sprite.image.height,
    })
    gameState.debug = true
    game.start()
  })

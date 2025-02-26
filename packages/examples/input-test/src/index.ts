import {
  Game,
  GameDrawing,
  GameKeyboard,
  gameKeyboard,
  GameMouse,
  gameMouse,
  GameRoom,
  gameRooms,
} from '@bite-wood/core'

class Room extends GameRoom {
  constructor() {
    super({ width: 800, height: 600 })

    this.backgroundColor = '#222'
  }
  draw(drawing: GameDrawing) {
    super.draw(drawing)
    this.drawController(drawing, 'gameKeyboard', gameKeyboard, 100)
    this.drawController(drawing, 'gameMouse', gameMouse, 350)
  }

  drawController(
    drawing: GameDrawing,
    name: string,
    controller: GameKeyboard | GameMouse,
    y: number,
  ) {
    const titleFontSize = 40
    const titleBottomMargin = 8
    const headerFontSize = 30
    const headerBottomMargin = 8
    const itemFontSize = 24

    drawing
      .setFontFamily('monospace')
      .setTextAlign('center')
      .setFillColor('#444')
      .setFontSize(titleFontSize)
      .text(name, this.width / 2, y)

    Object.entries(controller)
      .filter(([key, value]) => {
        return key === 'active' || key === 'down' || key === 'up'
      })
      .forEach(([category, values], columnIndex) => {
        const columnWidth = 200
        const columnX = 200 + columnWidth * columnIndex
        const columnY = y + titleFontSize + titleBottomMargin

        drawing
          .setFontFamily('monospace')
          .setTextAlign('center')
          .setFillColor('#fff')
          .setFontSize(headerFontSize)
          .text(category, columnX, columnY)

        Object.entries(values)
          .filter(([keyName, keyState]) => keyState === true)
          .forEach(([keyName, keyState], rowIndex) => {
            const rowOffset =
              (rowIndex + 1) * (headerFontSize * 1.15) + headerBottomMargin

            const textWidth = drawing.measureText(keyName)
            const padX = 4

            drawing
              .setFillColor('#000')
              .rectangle(
                columnX - padX - textWidth / 2,
                columnY + rowOffset - itemFontSize,
                textWidth + padX * 2,
                itemFontSize * 1.2,
              )
              .setFontSize(itemFontSize)
              .setFillColor('#fff')
              .text(keyName, columnX, columnY + rowOffset)
          })
      })
  }
}

gameRooms.addRoom(new Room())

const game = new Game()
game.start()

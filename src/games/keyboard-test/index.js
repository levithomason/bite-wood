import { Game, gameKeyboard, GameRoom, gameRooms } from '../../core/index.js'

class Room extends GameRoom {
  constructor() {
    super({ width: 800, height: 600 })

    this.backgroundColor = '#222'
  }
  draw(drawing) {
    super.draw(drawing)

    const headerFontSize = 30
    const headerBottomMargin = 8
    const itemFontSize = 24

    Object.entries(gameKeyboard).forEach(([category, values], columnIndex) => {
      const columnWidth = 200
      const columnX = 200 + columnWidth * columnIndex
      const columnY = 100

      drawing
        .setFontFamily('monospace')
        .setTextAlign('center')
        .setFillColor('#fff')
        .setFontSize(headerFontSize)
        .text(category, columnX, columnY)

      Object.entries(values).forEach(([keyName, keyState], rowIndex) => {
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

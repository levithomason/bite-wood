import { Game, gameKeyboard, GameRoom, gameRooms } from '../../core/index.js'

class Room extends GameRoom {
  constructor() {
    super(800, 600)

    this.backgroundColor = '#222'
  }
  draw(drawing) {
    super.draw(drawing)

    drawing.setFillColor('#fff')
    const headerFontSize = 24
    const headerBottomMargin = 8
    const itemFontSize = 21

    Object.entries(gameKeyboard).forEach(([category, values], columnIndex) => {
      const columnWidth = 200
      const columnX = 100 + columnWidth * columnIndex
      const columnY = 100

      drawing.setFontSize(headerFontSize).text(category, columnX, columnY)

      Object.entries(values).forEach(([keyName, keyState], rowIndex) => {
        const rowOffset =
          (rowIndex + 1) * (headerFontSize * 1.15) + headerBottomMargin

        drawing
          .setFontSize(itemFontSize)
          .text(JSON.stringify(keyName), columnX, columnY + rowOffset)
      })
    })
  }
}

gameRooms.addRoom(new Room())

const game = new Game()
game.start()

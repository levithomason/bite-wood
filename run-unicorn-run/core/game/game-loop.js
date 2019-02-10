import * as draw from '../draw.js'
import state from '../state.js'

const step = () => {
  if (!state.isPlaying) return
  if (!state.room) return

  state.room.objects.forEach(object => {
    if (object.step) {
      object.step(object, state)
    }
  })
}

const drawRoom = () => {
  if (!state.room) return

  if (state.room.backgroundColor) {
    draw.setColor(state.room.backgroundColor)
    draw.rectangle(0, 0, state.room.width, state.room.height)
  }

  if (state.room.backgroundImage) {
    draw.image(state.room.backgroundImage)
  }

  if (state.room.draw) {
    state.room.draw()
  }
}

const drawObjects = () => {
  if (!state.room) return

  state.room.objects.forEach(object => {
    if (object.draw) object.draw()

    if (
      state.isPlaying &&
      object.events &&
      object.events.draw &&
      object.events.draw.actions
    ) {
      object.events.draw.actions.forEach(action => {
        action(object, state)
      })
    }
  })
}

const drawDebug = () => {
  draw.grid()
  draw.text(
    `${state.mouse.x}, ${state.mouse.y}`,
    state.mouse.x + 10,
    state.mouse.y - 10,
  )
}

const drawGame = () => {
  draw.erase()
  drawRoom()
  drawObjects()
  if (state.debug) drawDebug()

  if (!state.isPlaying) {
    draw.setColor('rgba(0, 0, 0, 0.65)')
    draw.rectangle(0, 0, state.room.width, state.room.height)
    draw.setColor('#fff')
    draw.text(
      `PRESS "P" TO PLAY`,
      state.room.width / 2 - 40,
      state.room.height / 2,
    )
  }
}

const tick = () => {
  step()
  drawGame()
  tick.nextFrame = requestAnimationFrame(tick)
}

const gameLoop = {
  start: () => tick(),
  stop: () => cancelAnimationFrame(tick.nextFrame),
}

window.gameLoop = gameLoop

export default gameLoop

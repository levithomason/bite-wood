const keypress = require('keypress')
const ctx = require('axel')

// make `process.stdin` begin emitting "keypress" events
process.stdin.setRawMode(true)
keypress(process.stdin)
process.stdin.resume()

const brushes = {
  clear: ' ',
  mediumLight: '░',
  mediumDark: '▓',
  dark: '█',

  dot: '•',
}

const game = {
  speed: 10,
  width: 50,
  height: 20,

  draw() {
    // sky
    ctx.brush = brushes.clear
    ctx.bg(0, 192, 192)
    ctx.fg(0, 0, 0)
    ctx.box(0, 0, game.width, game.height)

    // sun
    ctx.brush = brushes.clear
    ctx.bg(255, 255, 0)
    ctx.fg(255, 255, 0)
    ctx.circ(10, 5, 1)
    ctx.circ(10, 5, 2)
    ctx.circ(10, 5, 3)

    ctx.cursor.restore()
  },
}

const ground = {
  top: Math.floor(game.height * 0.7),

  draw() {
    // dirt
    ctx.brush = brushes.clear
    ctx.bg(128, 64, 0)
    ctx.fg(128, 64, 0)
    ctx.box(0, ground.top, game.width, game.height - ground.top)

    // specs
    // ctx.bg(128, 64, 0)
    // const specs = '☀︎☼♢☇♒︎⚬☌⚇⚆⚈°¨`˙˚¸˛ˆ˘ˇ–‑—_¯∴∵∶∷⋰⋱⋯⋮∙•・◦●○◎◉⦿⁃▽▾▿▴▵✣✥✤✢'
    // const num = 100
    //
    // for (var i = 0; i < num; i += 1) {
    //   const x = Math.floor(game.width * Math.random())
    //   const y = Math.floor(
    //     ground.top + (game.height - ground.top) * Math.random(),
    //   )
    //   const brush = specs.charAt(Math.floor(Math.random() * specs.length))
    //   const brightness = Math.random()
    //
    //   ctx.fg(brightness * 32, brightness * 16, 0)
    //   ctx.point(x, y, brush)
    // }

    // grass
    ctx.brush = brushes.mediumLight
    ctx.bg(0, 128, 0)
    ctx.fg(128, 255, 0)
    ctx.line(0, ground.top, game.width, ground.top)

    ctx.cursor.restore()
  },
}

const player = {
  x: 5,
  y: ground.top - 1,
  sprite: '🦄',

  moveUp: () => player.y--,
  moveDown: () => player.y++,
  moveRight: () => player.x++,
  moveLeft: () => player.x--,

  draw() {
    ctx.bg(0, 192, 192)
    ctx.point(player.x, player.y, player.sprite)
    ctx.cursor.restore()
  },
}
process.stdin.on('keypress', (ch, key) => {
  // console.log(key)
  if (key && key.ctrl && key.name === 'c') {
    process.stdin.pause()
    process.exit()
  }
  if (key.name === 'up') player.moveUp()
  if (key.name === 'down') player.moveDown()
  if (key.name === 'left') player.moveLeft()
  if (key.name === 'right') player.moveRight()
})

const draw = () => {
  ctx.clear()
  game.draw()
  ground.draw()
  player.draw()
}

draw()
setInterval(draw, 1000 / game.speed)

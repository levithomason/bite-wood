import { GameDrawing } from './game-drawing.js'

export const gameDrawing = new GameDrawing(800, 600)
window.biteWood = window.biteWood || {}
window.biteWood.gameDrawing = gameDrawing

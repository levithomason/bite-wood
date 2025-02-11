declare global {
  interface Window {
    biteWood: {
      game: Game
      GameObject: typeof GameObject
      GameRoom: typeof GameRoom
      gameCamera: GameCamera
      gameDrawing: GameDrawing
      gameKeyboard: GameKeyboard
      gameMouse: GameMouse
      gamePhysics: GamePhysics
      gameRooms: GameRooms
      gameState: GameState
    }
  }
}

export {}

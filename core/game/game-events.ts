import GameObject from './game-object'

// TODO should be defined in CORE input controller
export enum CoreMouseEvents {
  move = 'move',
  leftUp = 'leftUp',
  leftDown = 'leftDown',
  rightUp = 'rightUp',
  rightDown = 'rightDown',
  middleUp = 'middleUp',
  middleDown = 'middleDown',
}

type GameEventCreate = (self: GameObject) => any

type GameEventDraw = (self: GameObject) => any

type GameEventKeyboard = (
  alt: KeyboardEvent['altKey'],
  ctrl: KeyboardEvent['ctrlKey'],
  shift: KeyboardEvent['shiftKey'],
  event: KeyboardEvent,
) => any

type GameEventMouse = (
  alt: MouseEvent['altKey'],
  ctrl: MouseEvent['ctrlKey'],
  shift: MouseEvent['shiftKey'],
  event: MouseEvent,
) => any

type GameEventStep = (self: GameObject) => any

export default interface GameEventHooks {
  create: {
    actions: [GameEventCreate]
  }
  draw: {
    actions: [GameEventDraw]
  }
  input: {
    keyboard: {
      [key: KeyboardEvent['key']]: [GameEventKeyboard]
    }
    mouse: { [key in CoreMouseEvents]: [GameEventMouse] }
  }
  step: {
    actions: [GameEventStep]
  }
}

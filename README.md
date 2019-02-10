# Assets

https://craftpix.net/freebies

# TODO

## Game state
state.{width,height}
These were game.width and game.height.  Where to manage game settings?  Create a game state? 

## Levels / Rooms
Each level has a set of objects
Introduce 'active' and .deactivate() to temp remove instances from the game, see solid.js.

## Input
Keyboard doesn't handle multiple presses between frames.  Uses queues instead. 

## Object Def
Convert to classes for re-use and multi instance
Forms will have to generate class syntax

## Drawing

Allow options to drawing methods for setting the style on a one-off shape.
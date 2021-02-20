# Assets

https://craftpix.net/freebies

# TODO

## Level editor
Add basic editor for setting background color/image/music and placing objects. 

## Levels / Rooms
Introduce 'active' and .deactivate() to temp remove instances from the game, see solid.js.

## Assets

## Sound
Can't play the same sound multiple times quickly.
Mute all sounds

## Input
Keyboard doesn't handle multiple presses between frames.  Uses queues instead.
Pressing cmd left/right screws up the input
Pressing right + left screws up walking 

## Storage
Save to local storage
Download as JSON
Load from url parse

## Objects
Introduce create method, fromJSON, and toJSON
Convert to classes for re-use and multi instance
Forms will have to generate class syntax

Create collisions event for objects, cached and more performant.
Check collisions after game loop step.
Invoke collision events similar to mouse and keyboard events. 

Allow pure canvas drawn objects with no sprite?

Need to reference room properties at object creation...
Can't because objects are created before state.room is set
Set apple to random room.width...

## Drawing
Allow options to drawing methods for setting the style on a one-off shape.

## State
Currently state.js listens for keyboard and mouse events globally.  However, when
importing GameDrawing into the sprite editor, those listeners are invoked... so "p"
attempts and fails to pause/play the game state.

This is because the import chain GameDrawing > collision > state. 

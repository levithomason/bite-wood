import LocalSync from './lib/local-sync.js'

//
// CONSTANTS
//

export const BUCKETS = {
  SPRITES: 'sprites',
  SPRITE_EDITOR: 'spriteEditor',
}

export const KEYS = {
  LAST_ACTIVE_UID: 'lastActiveUID',
}

//
// Storage
//

const storage = new LocalSync({
  prefix: 'GAME_NAME',
  bucket: 'sprites',
})

//
// ADDITIONAL API
//

export const saveState = (state) => {
  storage.setBucket(BUCKETS.SPRITES)
  storage.set(state.uid, state)
}

export const loadState = (uid) => {
  if (!uid) {
    const originalBucket = storage.getBucket()

    storage.setBucket(BUCKETS.SPRITE_EDITOR)
    uid = storage.get(KEYS.LAST_ACTIVE_UID)

    storage.setBucket(originalBucket)
  }

  return storage.get(uid) || storage.getFirst()
}

window.storage = storage
export default storage

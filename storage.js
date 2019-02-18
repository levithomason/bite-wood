const storage = {
  get: key => {
    const val = localStorage.getItem(key)
    if (val === null) return null

    return JSON.parse(val)
  },
  set: (key, val) => {
    localStorage.setItem(key, JSON.stringify(val))
  },
  clear: () => {
    localStorage.clear()
  },
  keys: () => {
    return Object.keys(localStorage)
  },
  first: () => {
    return storage.get(storage.keys()[0])
  },
  last: () => {
    const keys = storage.keys()
    return storage.get(keys[keys.length - 1])
  },
  values: () => {
    return storage.keys().map(storage.get)
  },
  read: () => {
    return storage.keys().reduce((acc, next) => {
      acc[next] = storage.get(next)

      return acc
    }, {})
  },
}
window.storage = storage

export default storage
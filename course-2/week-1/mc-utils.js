const makeStateActionKey = (s, a) => `${s}:${a}`

const initialiseStateActionMap = (S, A, makeInitialValue) => {
  const map = new Map()
  for (const s of S) {
    for (const a of A) {
      const key = makeStateActionKey(s, a)
      map.set(key, makeInitialValue())
    }
  }
  return map
}

const checkFirstVisit = (episode, t) =>
  episode.slice(0, t)
    .findIndex(({ s, a }) => s === episode[t].s && a === episode[t].a) < 0

module.exports = {
  makeStateActionKey,
  initialiseStateActionMap,
  checkFirstVisit
}

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

// https://stackoverflow.com/a/28933315
const probDistChoice = probDist => {

  const entries = Array.from(probDist.entries())
  const values = entries.map(([v]) => v)
  const weights = entries.map(([, w]) => w)

  const randomNumber = Math.random()
  const lastIndex = weights.length - 1
  let sum = 0

  for (let index = 0; index < lastIndex; index++) {
    sum += weights[index]
    if (randomNumber < sum) {
      return values[index]
    }
  }

  return values[lastIndex]
}

const makeEquiprobablePolicy = (S, A) => {
  const p = 1 / A.length
  const map = new Map(S.map(s => [s, new Map(A.map(a => [a, p]))]))
  console.dir(map)
  return s => {
    const probDist = map.get(s)
    return probDistChoice(probDist)
  }
}

module.exports = {
  makeStateActionKey,
  initialiseStateActionMap,
  checkFirstVisit,
  probDistChoice,
  makeEquiprobablePolicy
}

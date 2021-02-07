const yargs = require('yargs')

const configureGW = require('../../course-1/week-4/gw')
const U = require('../../utils')

const GAMMA = 1

const makeStateActionKey = (s, a) => `${s}:${a}`

const generateEpisode = (pi, makeMove, s0, a0) => {
  const MAX_EPISODE_LENGTH = 25 // in case we get stuck
  const episode = []
  const { s2, r, done } = makeMove(s0, a0)
  episode.push({ s: s0, a: a0, r })
  if (done) return episode
  let s = s2
  for (; ;) {
    const a = pi.get(s)
    const { s2, r, done } = makeMove(s, a)
    episode.push({ s, a, r })
    if (done || episode.length >= MAX_EPISODE_LENGTH) break
    s = s2
  }
  return episode
}

const initialiseMap = (GW, makeInitialValue) => {
  const map = new Map()
  for (const s of GW.S) {
    for (const a of GW.A) {
      const key = makeStateActionKey(s, a)
      map.set(key, makeInitialValue())
    }
  }
  return map
}

const checkFirstVisit = (episode, t, s, a) =>
  episode.slice(0, t)
    .findIndex(tuple => tuple.s === s && tuple.a === a) < 0

const main = () => {
  const argv = yargs
    .option('e', {
      alias: 'enhanced',
      nargs: 0,
      describe: 'Use enhanced gridworld (versus regular gridworld)'
    })
    .wrap(null)
    .argv

  const GW = configureGW(argv.enhanced)
  const pi = new Map(GW.S.map(s => [s, 0]))
  const returns = initialiseMap(GW, () => [])
  const Q = initialiseMap(GW, () => 0)
  const MAX_EPISODES = argv.enhanced ? 50000 : 10000
  for (const _ of U.rangeIter(MAX_EPISODES)) {
    const s0 = U.randomChoice(GW.S)
    const a0 = U.randomChoice(GW.A)
    const episode = generateEpisode(pi, GW.makeMove, s0, a0)
    let G = 0
    const ts = U.range(episode.length)
    for (const t of ts.reverse()) {
      const { s: St, a: At, r } = episode[t]
      G = GAMMA * G + r
      const isFirstVisit = checkFirstVisit(episode, t, St, At)
      if (isFirstVisit) {
        const key = makeStateActionKey(St, At)
        const list = returns.get(key)
        list.push(G)
        const newAverage = U.average(list)
        Q.set(key, newAverage)
        const values = GW.A.map(a => Q.get(makeStateActionKey(St, a)))
        const index = U.argmax(values)
        pi.set(St, GW.A[index])
      }
    }
  }

  const V = new Map(GW.S_PLUS.map(s => {
    if (pi.has(s)) {
      const a = pi.get(s)
      return [s, Q.get(makeStateActionKey(s, a))]
    } else {
      return [s, 0]
    }
  }))
  
  GW.printResults(V, pi)
}

main()
